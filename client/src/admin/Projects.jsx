import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { adminApi, api, publicApi } from '../lib/api.js';
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

const BLANK = {
  title: '',
  category_id: '',
  client_name: '',
  location: '',
  year: new Date().getFullYear(),
  area_sqft: '',
  duration: '',
  summary: '',
  description: '',
  cover_image: '',
  tags: [],
  images: [],
  is_featured: false,
  is_active: true,
  sort_order: 0,
};

export default function Projects() {
  const { setOpen } = useOutletContext();
  const toast = useToast();

  const { data, loading, reload } = useApi(() => adminApi.list('projects'), []);
  const { data: categories } = useApi(() => publicApi.categories(), []);

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [loadingOne, setLoadingOne] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [busyDelete, setBusyDelete] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const rows = useMemo(() => {
    let list = data?.data ?? [];
    if (filter === 'featured') list = list.filter((p) => p.is_featured);
    if (filter === 'hidden') list = list.filter((p) => !p.is_active);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.location || '').toLowerCase().includes(q) ||
          (p.client_name || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [data, search, filter]);

  const set = (name) => (value) => setForm((f) => ({ ...f, [name]: value }));

  const openNew = () => {
    setForm({ ...BLANK, sort_order: data?.data?.length ?? 0 });
    setEditing('new');
  };

  const openEdit = async (row) => {
    setEditing(row.id);
    setLoadingOne(true);
    try {
      // The list endpoint omits gallery images; fetch the full record.
      const { data: full } = await api.get(`/projects/${row.id}`);
      setForm({
        ...BLANK,
        ...full,
        category_id: full.category_id ?? '',
        tags: Array.isArray(full.tags) ? full.tags : [],
        images: (full.images ?? []).map((i) => i.image_url),
      });
    } catch (err) {
      toast.error(err.message);
      setEditing(null);
    } finally {
      setLoadingOne(false);
    }
  };

  const save = async (e) => {
    e?.preventDefault();
    if (!form.title.trim()) return toast.error('Project title is required');

    setSaving(true);
    try {
      const payload = { ...form, category_id: form.category_id || null };
      if (editing === 'new') {
        await adminApi.create('projects', payload);
        toast.success('Project created');
      } else {
        await adminApi.update('projects', editing, payload);
        toast.success('Project updated');
      }
      setEditing(null);
      reload();
    } catch (err) {
      toast.error(err.details?.[0]?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (row, kind) => {
    try {
      await api.patch(`/projects/${row.id}/${kind}`, {}, true);
      reload();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const remove = async () => {
    setBusyDelete(true);
    try {
      await adminApi.remove('projects', deleting.id);
      toast.success('Project deleted');
      setDeleting(null);
      reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyDelete(false);
    }
  };

  return (
    <>
      <AdminHeader
        title="Projects"
        subtitle="The portfolio shown on Our Work and the featured grid on the home page"
        onMenu={() => setOpen(true)}
      >
        <button className="btn btn--sm" onClick={openNew}>
          <Icon.plus /> Add project
        </button>
      </AdminHeader>

      <div className="admin-body">
        <div className="a-toolbar">
          <div className="a-search">
            <Icon.search />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, client or area"
            />
          </div>
          <div className="seg">
            {[
              ['all', 'All'],
              ['featured', 'Featured'],
              ['hidden', 'Hidden'],
            ].map(([key, label]) => (
              <button
                key={key}
                className={filter === key ? 'is-active' : ''}
                onClick={() => setFilter(key)}
              >
                {label}
              </button>
            ))}
          </div>
          <span style={{ fontSize: '0.84rem', color: 'var(--muted)', marginLeft: 'auto' }}>
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
                    <th>Project</th>
                    <th style={{ width: 160 }}>Category</th>
                    <th style={{ width: 150 }}>Location</th>
                    <th style={{ width: 90 }}>Photos</th>
                    <th style={{ width: 110 }}>Status</th>
                    <th style={{ width: 160, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className="a-cell-main">
                          {p.cover_image ? (
                            <img className="a-thumb" src={p.cover_image} alt="" />
                          ) : (
                            <span className="a-thumb" />
                          )}
                          <div style={{ minWidth: 0 }}>
                            <b>{p.title}</b>
                            <small>
                              {p.client_name || 'No client'} · {p.year || '—'}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>{p.category_name || '—'}</td>
                      <td>{p.location || '—'}</td>
                      <td>{(p.image_count ?? 0) + (p.cover_image ? 1 : 0)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                          <StatusChip active={p.is_active} />
                          {p.is_featured && <span className="chip chip--gold">Featured</span>}
                        </div>
                      </td>
                      <td>
                        <div className="row-actions">
                          <button
                            className="icon-btn"
                            onClick={() => toggle(p, 'feature')}
                            title={p.is_featured ? 'Remove from home page' : 'Feature on home page'}
                          >
                            <Icon.star />
                          </button>
                          <button
                            className="icon-btn"
                            onClick={() => toggle(p, 'toggle')}
                            title={p.is_active ? 'Hide from website' : 'Show on website'}
                          >
                            {p.is_active ? <Icon.eye /> : <Icon.eyeOff />}
                          </button>
                          <button className="icon-btn" onClick={() => openEdit(p)} title="Edit">
                            <Icon.edit />
                          </button>
                          <button
                            className="icon-btn icon-btn--danger"
                            onClick={() => setDeleting(p)}
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
              icon="grid"
              title={search || filter !== 'all' ? 'Nothing matches' : 'No projects yet'}
              text="Add a project with a cover photo and a gallery, and it appears on Our Work immediately."
              action={
                <button className="btn btn--sm" onClick={openNew}>
                  <Icon.plus /> Add project
                </button>
              }
            />
          )}
        </div>
      </div>

      {/* --------------------------------------------------- editor */}
      <Modal
        open={editing !== null}
        size="wide"
        title={editing === 'new' ? 'New project' : 'Edit project'}
        onClose={() => setEditing(null)}
        footer={
          <>
            <button className="btn btn--ghost btn--sm" onClick={() => setEditing(null)} disabled={saving}>
              Cancel
            </button>
            <button className="btn btn--sm" onClick={save} disabled={saving || loadingOne}>
              {saving ? <span className="spinner" /> : <Icon.save />}
              {saving ? 'Saving…' : 'Save project'}
            </button>
          </>
        }
      >
        {loadingOne ? (
          <div style={{ textAlign: 'center', padding: 50 }}>
            <span className="spinner spinner--dark" />
          </div>
        ) : (
          <form onSubmit={save}>
            <div className="a-grid-2">
              <Field label="Project title" required full>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => set('title')(e.target.value)}
                  placeholder="Ivory & Walnut L-Shaped Kitchen"
                />
              </Field>

              <Field label="Category">
                <select value={form.category_id} onChange={(e) => set('category_id')(e.target.value)}>
                  <option value="">— none —</option>
                  {(categories?.data ?? []).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Client name">
                <input
                  type="text"
                  value={form.client_name ?? ''}
                  onChange={(e) => set('client_name')(e.target.value)}
                />
              </Field>

              <Field label="Location">
                <input
                  type="text"
                  value={form.location ?? ''}
                  onChange={(e) => set('location')(e.target.value)}
                  placeholder="Bopal, Ahmedabad"
                />
              </Field>

              <Field label="Year">
                <input
                  type="number"
                  value={form.year ?? ''}
                  onChange={(e) => set('year')(e.target.value === '' ? '' : Number(e.target.value))}
                />
              </Field>

              <Field label="Area">
                <input
                  type="text"
                  value={form.area_sqft ?? ''}
                  onChange={(e) => set('area_sqft')(e.target.value)}
                  placeholder="96 sq ft"
                />
              </Field>

              <Field label="Duration">
                <input
                  type="text"
                  value={form.duration ?? ''}
                  onChange={(e) => set('duration')(e.target.value)}
                  placeholder="32 days"
                />
              </Field>

              <Field label="Summary" hint="One line shown under the project title" full>
                <textarea
                  rows={2}
                  value={form.summary ?? ''}
                  onChange={(e) => set('summary')(e.target.value)}
                />
              </Field>

              <Field label="Full description" full>
                <textarea
                  rows={6}
                  value={form.description ?? ''}
                  onChange={(e) => set('description')(e.target.value)}
                />
              </Field>

              <Field label="Cover image" hint="Used on cards and as the first gallery photo" full>
                <ImagePicker value={form.cover_image} onChange={set('cover_image')} folder="projects" />
              </Field>

              <Field label="Gallery images" full>
                <GalleryPicker value={form.images} onChange={set('images')} />
              </Field>

              <Field label="Tags" hint="Shown as pills on the project page" full>
                <ListEditor value={form.tags} onChange={set('tags')} placeholder="Add a tag" />
              </Field>

              <Field label="Display order" hint="Lower numbers appear first">
                <input
                  type="number"
                  value={form.sort_order ?? 0}
                  onChange={(e) => set('sort_order')(Number(e.target.value))}
                />
              </Field>

              <Field label="Visibility">
                <div style={{ display: 'grid', gap: 12, paddingTop: 6 }}>
                  <Switch
                    checked={form.is_active}
                    onChange={set('is_active')}
                    label="Show on the website"
                  />
                  <Switch
                    checked={form.is_featured}
                    onChange={set('is_featured')}
                    label="Feature on the home page"
                  />
                </div>
              </Field>
            </div>
            <button type="submit" hidden />
          </form>
        )}
      </Modal>

      <Confirm
        open={Boolean(deleting)}
        title="Delete this project?"
        message={`"${deleting?.title ?? ''}" and all of its gallery images will be removed permanently.`}
        busy={busyDelete}
        onCancel={() => setDeleting(null)}
        onConfirm={remove}
      />
    </>
  );
}
