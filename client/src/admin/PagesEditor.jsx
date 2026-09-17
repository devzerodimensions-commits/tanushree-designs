import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { adminApi } from '../lib/api.js';
import { useApi } from '../hooks/useApi.js';
import Icon from '../lib/icons.jsx';
import { AdminHeader } from './AdminLayout.jsx';
import { Field, ImagePicker, TableSkeleton, useToast } from './ui.jsx';

const prettify = (key) =>
  key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

/** Long copy gets a textarea, short labels get an input. */
const isLong = (value) => typeof value === 'string' && value.length > 90;

export default function PagesEditor() {
  const { setOpen } = useOutletContext();
  const toast = useToast();

  const { data, loading, reload } = useApi(() => adminApi.pages(), []);
  const [active, setActive] = useState(null);
  const [form, setForm] = useState(null);
  const [jsonErrors, setJsonErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const pages = data?.data ?? [];

  useEffect(() => {
    if (!active && pages.length) setActive(pages[0].slug);
  }, [pages, active]);

  const current = useMemo(() => pages.find((p) => p.slug === active), [pages, active]);

  useEffect(() => {
    if (current) {
      setForm({ ...current, sections: { ...(current.sections ?? {}) } });
      setJsonErrors({});
    }
  }, [current]);

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));
  const setSection = (key) => (value) =>
    setForm((f) => ({ ...f, sections: { ...f.sections, [key]: value } }));

  const save = async () => {
    if (Object.values(jsonErrors).some(Boolean)) {
      return toast.error('Fix the highlighted structured fields before saving');
    }
    setSaving(true);
    try {
      await adminApi.savePage(form.slug, form);
      toast.success(`"${form.title}" page updated`);
      reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) {
    return (
      <>
        <AdminHeader title="Page Content" onMenu={() => setOpen(true)} />
        <div className="admin-body">
          <div className="a-card a-card--flush">
            <TableSkeleton />
          </div>
        </div>
      </>
    );
  }

  const sectionKeys = Object.keys(form.sections ?? {});

  return (
    <>
      <AdminHeader
        title="Page Content"
        subtitle="Headings, intro copy and hero images for every public page"
        onMenu={() => setOpen(true)}
      >
        <button className="btn btn--sm" onClick={save} disabled={saving}>
          {saving ? <span className="spinner" /> : <Icon.save />}
          {saving ? 'Saving…' : 'Save page'}
        </button>
      </AdminHeader>

      <div className="admin-body">
        <div className="settings-tabs">
          {pages.map((p) => (
            <button
              key={p.slug}
              className={active === p.slug ? 'is-active' : ''}
              onClick={() => setActive(p.slug)}
            >
              {p.title}
            </button>
          ))}
        </div>

        <div className="a-card" style={{ marginBottom: 18 }}>
          <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1rem', fontWeight: 500, marginBottom: 18 }}>
            Hero
          </h3>

          <div className="a-grid-2">
            <Field label="Page title" hint="Used in the admin tabs and breadcrumbs">
              <input type="text" value={form.title ?? ''} onChange={(e) => set('title')(e.target.value)} />
            </Field>

            <Field label="URL slug">
              <input type="text" value={form.slug} disabled style={{ opacity: 0.6 }} />
            </Field>

            <Field label="Hero headline" full>
              <input
                type="text"
                value={form.hero_title ?? ''}
                onChange={(e) => set('hero_title')(e.target.value)}
              />
            </Field>

            <Field label="Hero sub-heading" full>
              <textarea
                rows={3}
                value={form.hero_subtitle ?? ''}
                onChange={(e) => set('hero_subtitle')(e.target.value)}
              />
            </Field>

            <Field label="Hero image" full>
              <ImagePicker value={form.hero_image} onChange={set('hero_image')} folder="general" />
            </Field>
          </div>
        </div>

        {sectionKeys.length > 0 && (
          <div className="a-card" style={{ marginBottom: 18 }}>
            <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1rem', fontWeight: 500, marginBottom: 6 }}>
              Section copy
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 20 }}>
              Every editable heading and paragraph on this page.
            </p>

            <div className="a-grid-2">
              {sectionKeys.map((key) => {
                const value = form.sections[key];

                if (key.endsWith('_image')) {
                  return (
                    <Field key={key} label={prettify(key)} full>
                      <ImagePicker value={value} onChange={setSection(key)} folder="general" />
                    </Field>
                  );
                }

                if (typeof value === 'string') {
                  return (
                    <Field key={key} label={prettify(key)} full={isLong(value)}>
                      {isLong(value) ? (
                        <textarea rows={4} value={value} onChange={(e) => setSection(key)(e.target.value)} />
                      ) : (
                        <input type="text" value={value} onChange={(e) => setSection(key)(e.target.value)} />
                      )}
                    </Field>
                  );
                }

                // Arrays / objects (e.g. the About page value cards).
                return (
                  <Field
                    key={key}
                    label={`${prettify(key)} (structured)`}
                    hint={jsonErrors[key] ? '⚠ Invalid JSON — fix before saving' : 'Edit as JSON'}
                    full
                  >
                    <textarea
                      rows={8}
                      defaultValue={JSON.stringify(value, null, 2)}
                      style={{
                        fontFamily: 'ui-monospace, monospace',
                        fontSize: '0.82rem',
                        borderColor: jsonErrors[key] ? '#c0392b' : undefined,
                      }}
                      onChange={(e) => {
                        try {
                          const parsed = JSON.parse(e.target.value);
                          setSection(key)(parsed);
                          setJsonErrors((p) => ({ ...p, [key]: false }));
                        } catch {
                          setJsonErrors((p) => ({ ...p, [key]: true }));
                        }
                      }}
                    />
                  </Field>
                );
              })}
            </div>
          </div>
        )}

        <div className="a-card">
          <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1rem', fontWeight: 500, marginBottom: 18 }}>
            Search engine listing
          </h3>

          <div className="a-grid-2">
            <Field label="SEO title" hint={`${(form.seo_title ?? '').length}/60 characters is ideal`} full>
              <input
                type="text"
                value={form.seo_title ?? ''}
                onChange={(e) => set('seo_title')(e.target.value)}
              />
            </Field>

            <Field
              label="Meta description"
              hint={`${(form.seo_description ?? '').length}/160 characters is ideal`}
              full
            >
              <textarea
                rows={3}
                value={form.seo_description ?? ''}
                onChange={(e) => set('seo_description')(e.target.value)}
              />
            </Field>
          </div>
        </div>

        <div style={{ marginTop: 18, display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn--sm" onClick={save} disabled={saving}>
            {saving ? <span className="spinner" /> : <Icon.save />}
            {saving ? 'Saving…' : 'Save page'}
          </button>
        </div>
      </div>
    </>
  );
}
