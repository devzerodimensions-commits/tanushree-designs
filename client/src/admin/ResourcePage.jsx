import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { adminApi } from '../lib/api.js';
import { useApi } from '../hooks/useApi.js';
import Icon from '../lib/icons.jsx';
import { AdminHeader } from './AdminLayout.jsx';
import {
  Confirm,
  EmptyState,
  Field,
  GalleryPicker,
  ImagePicker,
  ListEditor,
  Modal,
  StatusChip,
  Switch,
  TableSkeleton,
  useToast,
} from './ui.jsx';
import IncludedEditor from './IncludedEditor.jsx';
import { usageError } from '../../../shared/usage-percentages.mjs';

/**
 * Schema-driven CRUD screen. Every simple content table in the admin
 * panel is one of these, described by `fields` + `columns`.
 *
 * field: { name, label, type, required, hint, options, half, placeholder }
 * type : text | textarea | number | image | gallery | list | select | switch | color
 */
export default function ResourcePage({
  resource,
  title,
  subtitle,
  singular,
  fields,
  columns,
  defaults = {},
  emptyIcon = 'file',
  searchKeys = ['title', 'name'],
  notice,
}) {
  const { setOpen } = useOutletContext();
  const toast = useToast();

  const { data, loading, reload } = useApi(() => adminApi.list(resource), [resource]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [busyDelete, setBusyDelete] = useState(false);
  const [search, setSearch] = useState('');

  // Fields can pull their <option> list from an endpoint (e.g. linking a
  // testimonial to a project) instead of hard-coding choices.
  const [remoteOptions, setRemoteOptions] = useState({});
  useEffect(() => {
    for (const f of fields) {
      if (!f.optionsFrom) continue;
      adminApi
        .list(f.optionsFrom)
        .then(({ data }) =>
          setRemoteOptions((prev) => ({
            ...prev,
            [f.name]: data.map((row) => ({
              value: row.id,
              label: f.optionLabel ? f.optionLabel(row) : row.title || row.name,
            })),
          }))
        )
        .catch(() => setRemoteOptions((prev) => ({ ...prev, [f.name]: [] })));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource]);

  const rows = useMemo(() => {
    const list = data?.data ?? [];
    if (!search.trim()) return list;
    const q = search.trim().toLowerCase();
    return list.filter((r) =>
      searchKeys.some((k) => String(r[k] ?? '').toLowerCase().includes(q))
    );
  }, [data, search, searchKeys]);

  const openNew = () => {
    setForm({ is_active: true, sort_order: (data?.data?.length ?? 0), ...defaults });
    setEditing('new');
  };

  const openEdit = (row) => {
    setForm({ ...row });
    setEditing(row.id);
  };

  const set = (name) => (value) => setForm((f) => ({ ...f, [name]: value }));

  const save = async (e) => {
    e.preventDefault();
    const missing = fields.filter((f) => f.required && !String(form[f.name] ?? '').trim());
    if (missing.length) {
      toast.error(`${missing[0].label} is required`);
      return;
    }

    for (const field of fields.filter((f) => f.type === 'included')) {
      const error = usageError(form[field.name] ?? []);
      if (error) {
        toast.error(error);
        return;
      }
    }
    setSaving(true);
    try {
      if (editing === 'new') {
        await adminApi.create(resource, form);
        toast.success(`${singular} created`);
      } else {
        await adminApi.update(resource, editing, form);
        toast.success(`${singular} updated`);
      }
      setEditing(null);
      reload();
    } catch (err) {
      toast.error(err.details?.[0]?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (row) => {
    try {
      await adminApi.toggle(resource, row.id);
      reload();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const remove = async () => {
    setBusyDelete(true);
    try {
      await adminApi.remove(resource, deleting.id);
      toast.success(`${singular} deleted`);
      setDeleting(null);
      reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyDelete(false);
    }
  };

  const renderField = (f) => {
    const value = form[f.name];
    switch (f.type) {
      case 'textarea':
        return (
          <textarea
            value={value ?? ''}
            onChange={(e) => set(f.name)(e.target.value)}
            placeholder={f.placeholder}
            rows={f.rows || 4}
          />
        );
      case 'number':
        return (
          <input
            type="number"
            value={value ?? ''}
            onChange={(e) => set(f.name)(e.target.value === '' ? '' : Number(e.target.value))}
            min={f.min}
            max={f.max}
          />
        );
      case 'image':
        return <ImagePicker value={value} onChange={set(f.name)} folder={resource} />;
      case 'gallery':
        return <GalleryPicker value={value} onChange={set(f.name)} folder={resource} />;
      case 'list':
        return <ListEditor value={value ?? []} onChange={set(f.name)} placeholder={f.placeholder} />;
      case 'included':
        return <IncludedEditor value={value ?? []} onChange={set(f.name)} />;
      case 'select': {
        const options = f.optionsFrom ? (remoteOptions[f.name] ?? []) : f.options;
        return (
          <select value={value ?? ''} onChange={(e) => set(f.name)(e.target.value)}>
            {!f.required && <option value="">— none —</option>}
            {options.map((o) => (
              <option key={o.value ?? o} value={o.value ?? o}>
                {o.label ?? o}
              </option>
            ))}
          </select>
        );
      }
      case 'json':
        return (
          <textarea
            rows={f.rows || 8}
            defaultValue={JSON.stringify(value ?? [], null, 2)}
            style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.82rem' }}
            onChange={(e) => {
              try {
                set(f.name)(JSON.parse(e.target.value));
                e.target.style.borderColor = '';
              } catch {
                // Leave the text as typed and flag it; saving is blocked by
                // the parse failing, so a half-typed value cannot be stored.
                e.target.style.borderColor = '#c0392b';
              }
            }}
          />
        );
      case 'switch':
        return <Switch checked={value} onChange={set(f.name)} label={f.switchLabel || 'Enabled'} />;
      case 'color':
        return (
          <div className="color-field__row">
            <input type="color" value={value || '#000000'} onChange={(e) => set(f.name)(e.target.value)} />
            <input type="text" value={value ?? ''} onChange={(e) => set(f.name)(e.target.value)} />
          </div>
        );
      default:
        return (
          <input
            type="text"
            value={value ?? ''}
            onChange={(e) => set(f.name)(e.target.value)}
            placeholder={f.placeholder}
          />
        );
    }
  };

  return (
    <>
      <AdminHeader title={title} subtitle={subtitle} onMenu={() => setOpen(true)}>
        <button className="btn btn--sm" onClick={openNew}>
          <Icon.plus /> Add {singular.toLowerCase()}
        </button>
      </AdminHeader>

      <div className="admin-body">
        {/* A screen can warn about the state of its own rows — "nothing is
            priced yet", say. Given the loaded rows so it can decide, and
            skipped while they are still loading so it cannot flash. */}
        {!loading && notice?.(data?.data ?? [])}

        <div className="a-toolbar">
          <div className="a-search">
            <Icon.search />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${title.toLowerCase()}`}
            />
          </div>
          <span style={{ fontSize: '0.84rem', color: 'var(--muted)' }}>
            {rows.length} of {data?.data?.length ?? 0}
          </span>
        </div>

        <div className="a-card a-card--flush">
          {loading ? (
            <TableSkeleton />
          ) : rows.length ? (
            <div className="a-table-wrap">
              <table className="a-table">
                <thead>
                  <tr>
                    {columns.map((c) => (
                      <th key={c.key} style={c.width ? { width: c.width } : undefined}>
                        {c.label}
                      </th>
                    ))}
                    <th style={{ width: 130, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id}>
                      {columns.map((c) => (
                        <td key={c.key}>{c.render ? c.render(row) : (row[c.key] ?? '—')}</td>
                      ))}
                      <td>
                        <div className="row-actions">
                          {'is_active' in row && (
                            <button
                              className="icon-btn"
                              onClick={() => toggle(row)}
                              title={row.is_active ? 'Hide from website' : 'Show on website'}
                            >
                              {row.is_active ? <Icon.eye /> : <Icon.eyeOff />}
                            </button>
                          )}
                          <button className="icon-btn" onClick={() => openEdit(row)} title="Edit">
                            <Icon.edit />
                          </button>
                          <button
                            className="icon-btn icon-btn--danger"
                            onClick={() => setDeleting(row)}
                            title="Delete"
                          >
                            <Icon.trash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={emptyIcon}
              title={search ? 'Nothing matches that search' : `No ${title.toLowerCase()} yet`}
              text={
                search
                  ? 'Try a different term, or clear the search box.'
                  : `Add your first ${singular.toLowerCase()} and it will appear on the website straight away.`
              }
              action={
                !search && (
                  <button className="btn btn--sm" onClick={openNew}>
                    <Icon.plus /> Add {singular.toLowerCase()}
                  </button>
                )
              }
            />
          )}
        </div>
      </div>

      {/* ------------------------------------------------- edit modal */}
      <Modal
        open={editing !== null}
        title={editing === 'new' ? `New ${singular.toLowerCase()}` : `Edit ${singular.toLowerCase()}`}
        onClose={() => setEditing(null)}
        footer={
          <>
            <button className="btn btn--ghost btn--sm" onClick={() => setEditing(null)} disabled={saving}>
              Cancel
            </button>
            <button className="btn btn--sm" onClick={save} disabled={saving}>
              {saving ? <span className="spinner" /> : <Icon.save />}
              {saving ? 'Saving…' : 'Save'}
            </button>
          </>
        }
      >
        <form onSubmit={save}>
          <div className="a-grid-2">
            {fields.map((f) => (
              <Field key={f.name} label={f.label} required={f.required} hint={f.hint} full={!f.half}>
                {renderField(f)}
              </Field>
            ))}
          </div>

          <div className="a-grid-2" style={{ marginTop: 6 }}>
            <Field label="Display order" hint="Lower numbers appear first">
              <input
                type="number"
                value={form.sort_order ?? 0}
                onChange={(e) => set('sort_order')(Number(e.target.value))}
              />
            </Field>
            <Field label="Visibility">
              <Switch
                checked={form.is_active ?? true}
                onChange={set('is_active')}
                label="Show on the website"
              />
            </Field>
          </div>

          <button type="submit" hidden />
        </form>
      </Modal>

      <Confirm
        open={Boolean(deleting)}
        title={`Delete this ${singular.toLowerCase()}?`}
        message={`"${deleting?.title || deleting?.name || deleting?.question || ''}" will be removed from the website permanently.`}
        busy={busyDelete}
        onCancel={() => setDeleting(null)}
        onConfirm={remove}
      />
    </>
  );
}

/* ---------------------------------------------- shared cell renderers */
export const cellThumb = (imgKey, titleKey, subKey) => (row) => (
  <div className="a-cell-main">
    {row[imgKey] ? (
      <img className="a-thumb" src={row[imgKey]} alt="" />
    ) : (
      <span className="a-thumb" />
    )}
    <div style={{ minWidth: 0 }}>
      <b>{row[titleKey]}</b>
      {subKey && row[subKey] && <small>{String(row[subKey]).slice(0, 62)}</small>}
    </div>
  </div>
);

export const cellStatus = (row) => <StatusChip active={row.is_active} />;

export const cellTruncate = (key, len = 70) => (row) =>
  row[key] ? `${String(row[key]).slice(0, len)}${String(row[key]).length > len ? '…' : ''}` : '—';
