import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { adminApi } from '../lib/api.js';
import { useApi } from '../hooks/useApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useSite } from '../context/SiteContext.jsx';
import Icon from '../lib/icons.jsx';
import { AdminHeader } from './AdminLayout.jsx';
import { Field, ImagePicker, Switch, TableSkeleton, useToast } from './ui.jsx';

const TABS = [
  ['brand', 'Brand & Colours'],
  ['contact', 'Contact & Social'],
  ['home', 'Home Page Blocks'],
  ['seo', 'SEO'],
  ['account', 'Account'],
];

const COLOR_LABELS = {
  primary: 'Logo maroon',
  primary_dark: 'Deep maroon',
  secondary: 'Lifted red (hovers)',
  navy: 'Navy counter line',
  grey: 'Logo grey',
  cream: 'Soft background',
  ink: 'Charcoal / text',
  muted: 'Muted text',
};

export default function Settings() {
  const { setOpen } = useOutletContext();
  const { user, setUser } = useAuth();
  const { refresh } = useSite();
  const toast = useToast();

  const { data, loading } = useApi(() => adminApi.settings(), []);
  const [tab, setTab] = useState('brand');
  const [values, setValues] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data?.values) setValues(structuredClone(data.values));
  }, [data]);

  const setGroup = (group, key, value) =>
    setValues((v) => ({ ...v, [group]: { ...(v[group] ?? {}), [key]: value } }));

  const setColor = (key, value) =>
    setValues((v) => ({
      ...v,
      brand: { ...v.brand, colors: { ...(v.brand?.colors ?? {}), [key]: value } },
    }));

  const save = async () => {
    setSaving(true);
    try {
      await adminApi.saveSettings(values);
      await refresh();
      toast.success('Settings saved — the website has been updated');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !values) {
    return (
      <>
        <AdminHeader title="Settings" onMenu={() => setOpen(true)} />
        <div className="admin-body">
          <div className="a-card a-card--flush">
            <TableSkeleton />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminHeader
        title="Settings"
        subtitle="Brand colours, contact details and the blocks shown on the home page"
        onMenu={() => setOpen(true)}
      >
        {tab !== 'account' && (
          <button className="btn btn--sm" onClick={save} disabled={saving}>
            {saving ? <span className="spinner" /> : <Icon.save />}
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        )}
      </AdminHeader>

      <div className="admin-body">
        <div className="settings-tabs">
          {TABS.map(([key, label]) => (
            <button key={key} className={tab === key ? 'is-active' : ''} onClick={() => setTab(key)}>
              {label}
            </button>
          ))}
        </div>

        {/* ------------------------------------------------ brand */}
        {tab === 'brand' && (
          <>
            <div className="a-card" style={{ marginBottom: 18 }}>
              <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1rem', fontWeight: 500, marginBottom: 18 }}>
                Identity
              </h3>
              <div className="a-grid-2">
                <Field label="Business name">
                  <input
                    type="text"
                    value={values.brand?.name ?? ''}
                    onChange={(e) => setGroup('brand', 'name', e.target.value)}
                  />
                </Field>
                <Field label="Tagline">
                  <input
                    type="text"
                    value={values.brand?.tagline ?? ''}
                    onChange={(e) => setGroup('brand', 'tagline', e.target.value)}
                  />
                </Field>
                <Field
                  label="Logo image"
                  hint="Leave empty to use the built-in wordmark with the brand colours"
                  full
                >
                  <ImagePicker
                    value={values.brand?.logo_url}
                    onChange={(v) => setGroup('brand', 'logo_url', v)}
                    folder="general"
                  />
                </Field>
              </div>
            </div>

            <div className="a-card">
              <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1rem', fontWeight: 500, marginBottom: 6 }}>
                Colour palette
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 20 }}>
                These feed the CSS variables used across the whole website. Save to see them applied
                live.
              </p>

              <div className="color-row">
                {Object.entries(COLOR_LABELS).map(([key, label]) => (
                  <div className="color-field" key={key}>
                    <label>{label}</label>
                    <div className="color-field__row">
                      <input
                        type="color"
                        value={values.brand?.colors?.[key] || '#000000'}
                        onChange={(e) => setColor(key, e.target.value)}
                      />
                      <input
                        type="text"
                        value={values.brand?.colors?.[key] ?? ''}
                        onChange={(e) => setColor(key, e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ---------------------------------------------- contact */}
        {tab === 'contact' && (
          <>
            <div className="a-card" style={{ marginBottom: 18 }}>
              <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1rem', fontWeight: 500, marginBottom: 18 }}>
                Contact details
              </h3>
              <div className="a-grid-2">
                <Field label="Phone (display)">
                  <input
                    type="text"
                    value={values.contact?.phone ?? ''}
                    onChange={(e) => setGroup('contact', 'phone', e.target.value)}
                  />
                </Field>
                <Field label="Phone (dial)" hint="Digits only, with country code">
                  <input
                    type="text"
                    value={values.contact?.phone_raw ?? ''}
                    onChange={(e) => setGroup('contact', 'phone_raw', e.target.value)}
                  />
                </Field>
                <Field label="WhatsApp number" hint="Digits only, e.g. 919881697860">
                  <input
                    type="text"
                    value={values.contact?.whatsapp ?? ''}
                    onChange={(e) => setGroup('contact', 'whatsapp', e.target.value)}
                  />
                </Field>
                <Field label="Email address">
                  <input
                    type="email"
                    value={values.contact?.email ?? ''}
                    onChange={(e) => setGroup('contact', 'email', e.target.value)}
                  />
                </Field>
                <Field label="Studio address" full>
                  <textarea
                    rows={2}
                    value={values.contact?.address ?? ''}
                    onChange={(e) => setGroup('contact', 'address', e.target.value)}
                  />
                </Field>
                <Field label="Opening hours">
                  <input
                    type="text"
                    value={values.contact?.hours ?? ''}
                    onChange={(e) => setGroup('contact', 'hours', e.target.value)}
                  />
                </Field>
                <Field label="Google Maps embed URL" hint="Must end with &output=embed">
                  <input
                    type="url"
                    value={values.contact?.map_embed ?? ''}
                    onChange={(e) => setGroup('contact', 'map_embed', e.target.value)}
                  />
                </Field>
              </div>
            </div>

            <div className="a-card">
              <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1rem', fontWeight: 500, marginBottom: 6 }}>
                Social profiles
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 20 }}>
                Leave a field empty to hide that icon in the footer.
              </p>
              <div className="a-grid-2">
                {['instagram', 'facebook', 'youtube', 'pinterest', 'linkedin'].map((key) => (
                  <Field key={key} label={key[0].toUpperCase() + key.slice(1)}>
                    <input
                      type="url"
                      value={values.social?.[key] ?? ''}
                      onChange={(e) => setGroup('social', key, e.target.value)}
                      placeholder="https://…"
                    />
                  </Field>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ------------------------------------------------- home */}
        {tab === 'home' && (
          <>
            <div className="a-card" style={{ marginBottom: 18 }}>
              <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1rem', fontWeight: 500, marginBottom: 18 }}>
                Announcement bar
              </h3>
              <div className="a-grid-2">
                <Field label="Show the bar" full>
                  <Switch
                    checked={values.announcement?.enabled}
                    onChange={(v) => setGroup('announcement', 'enabled', v)}
                    label="Display above the header"
                  />
                </Field>
                <Field label="Message" full>
                  <input
                    type="text"
                    value={values.announcement?.text ?? ''}
                    onChange={(e) => setGroup('announcement', 'text', e.target.value)}
                  />
                </Field>
                <Field label="Link text">
                  <input
                    type="text"
                    value={values.announcement?.link_text ?? ''}
                    onChange={(e) => setGroup('announcement', 'link_text', e.target.value)}
                  />
                </Field>
                <Field label="Link URL">
                  <input
                    type="text"
                    value={values.announcement?.link_url ?? ''}
                    onChange={(e) => setGroup('announcement', 'link_url', e.target.value)}
                  />
                </Field>
              </div>
            </div>

            <div className="a-card" style={{ marginBottom: 18 }}>
              <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1rem', fontWeight: 500, marginBottom: 6 }}>
                Hero slides
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 20 }}>
                The rotating full-screen banner at the top of the home page.
              </p>

              {(values.hero_slides ?? []).map((slide, i) => (
                <div
                  key={i}
                  style={{
                    border: '1px solid var(--admin-line)',
                    borderRadius: 12,
                    padding: 18,
                    marginBottom: 14,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 14,
                    }}
                  >
                    <b style={{ fontWeight: 500, fontSize: '0.9rem' }}>Slide {i + 1}</b>
                    <button
                      className="icon-btn icon-btn--danger"
                      onClick={() =>
                        setValues((v) => ({
                          ...v,
                          hero_slides: v.hero_slides.filter((_, idx) => idx !== i),
                        }))
                      }
                      aria-label="Remove slide"
                    >
                      <Icon.trash />
                    </button>
                  </div>

                  <div className="a-grid-2">
                    <Field label="Image" full>
                      <ImagePicker
                        value={slide.image}
                        onChange={(url) =>
                          setValues((v) => ({
                            ...v,
                            hero_slides: v.hero_slides.map((s, idx) =>
                              idx === i ? { ...s, image: url } : s
                            ),
                          }))
                        }
                        folder="general"
                      />
                    </Field>

                    {['eyebrow', 'title', 'text'].map((key) => (
                      <Field key={key} label={key[0].toUpperCase() + key.slice(1)} full={key !== 'eyebrow'}>
                        {key === 'text' ? (
                          <textarea
                            rows={2}
                            value={slide[key] ?? ''}
                            onChange={(e) =>
                              setValues((v) => ({
                                ...v,
                                hero_slides: v.hero_slides.map((s, idx) =>
                                  idx === i ? { ...s, [key]: e.target.value } : s
                                ),
                              }))
                            }
                          />
                        ) : (
                          <input
                            type="text"
                            value={slide[key] ?? ''}
                            onChange={(e) =>
                              setValues((v) => ({
                                ...v,
                                hero_slides: v.hero_slides.map((s, idx) =>
                                  idx === i ? { ...s, [key]: e.target.value } : s
                                ),
                              }))
                            }
                          />
                        )}
                      </Field>
                    ))}
                  </div>
                </div>
              ))}

              <button
                className="btn btn--ghost btn--sm"
                onClick={() =>
                  setValues((v) => ({
                    ...v,
                    hero_slides: [...(v.hero_slides ?? []), { image: '', eyebrow: '', title: '', text: '' }],
                  }))
                }
              >
                <Icon.plus /> Add slide
              </button>
            </div>

            <div className="a-card">
              <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1rem', fontWeight: 500, marginBottom: 6 }}>
                Trust strip
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 20 }}>
                The four promises shown just under the hero.
              </p>

              {(values.usps ?? []).map((u, i) => (
                <div className="a-grid-3" key={i} style={{ marginBottom: 12, alignItems: 'end' }}>
                  <Field label="Icon">
                    <select
                      value={u.icon ?? 'shield'}
                      onChange={(e) =>
                        setValues((v) => ({
                          ...v,
                          usps: v.usps.map((x, idx) => (idx === i ? { ...x, icon: e.target.value } : x)),
                        }))
                      }
                    >
                      {['shield', 'calendar', 'tag', 'award', 'check', 'ruler', 'sparkle'].map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Title">
                    <input
                      type="text"
                      value={u.title ?? ''}
                      onChange={(e) =>
                        setValues((v) => ({
                          ...v,
                          usps: v.usps.map((x, idx) => (idx === i ? { ...x, title: e.target.value } : x)),
                        }))
                      }
                    />
                  </Field>
                  <Field label="Text">
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        type="text"
                        value={u.text ?? ''}
                        onChange={(e) =>
                          setValues((v) => ({
                            ...v,
                            usps: v.usps.map((x, idx) => (idx === i ? { ...x, text: e.target.value } : x)),
                          }))
                        }
                      />
                      <button
                        className="icon-btn icon-btn--danger"
                        onClick={() =>
                          setValues((v) => ({ ...v, usps: v.usps.filter((_, idx) => idx !== i) }))
                        }
                        aria-label="Remove"
                      >
                        <Icon.trash />
                      </button>
                    </div>
                  </Field>
                </div>
              ))}

              <button
                className="btn btn--ghost btn--sm"
                onClick={() =>
                  setValues((v) => ({
                    ...v,
                    usps: [...(v.usps ?? []), { icon: 'shield', title: '', text: '' }],
                  }))
                }
              >
                <Icon.plus /> Add item
              </button>
            </div>
          </>
        )}

        {/* -------------------------------------------------- seo */}
        {tab === 'seo' && (
          <div className="a-card">
            <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1rem', fontWeight: 500, marginBottom: 18 }}>
              Default search engine listing
            </h3>
            <div className="a-grid-2">
              <Field label="Site title" full>
                <input
                  type="text"
                  value={values.seo?.site_title ?? ''}
                  onChange={(e) => setGroup('seo', 'site_title', e.target.value)}
                />
              </Field>
              <Field label="Meta description" full>
                <textarea
                  rows={3}
                  value={values.seo?.description ?? ''}
                  onChange={(e) => setGroup('seo', 'description', e.target.value)}
                />
              </Field>
              <Field label="Keywords" hint="Comma separated" full>
                <input
                  type="text"
                  value={values.seo?.keywords ?? ''}
                  onChange={(e) => setGroup('seo', 'keywords', e.target.value)}
                />
              </Field>
              <Field label="Social share image" hint="1200 × 630 works best" full>
                <ImagePicker
                  value={values.seo?.og_image}
                  onChange={(v) => setGroup('seo', 'og_image', v)}
                  folder="general"
                />
              </Field>
            </div>
          </div>
        )}

        {/* ---------------------------------------------- account */}
        {tab === 'account' && <AccountTab user={user} setUser={setUser} />}
      </div>
    </>
  );
}

/* ---------------------------------------------------------- account */
function AccountTab({ user, setUser }) {
  const toast = useToast();
  const [profile, setProfile] = useState({ name: user?.name ?? '', email: user?.email ?? '' });
  const [pw, setPw] = useState({ current_password: '', new_password: '', confirm: '' });
  const [busy, setBusy] = useState(false);

  const saveProfile = async () => {
    setBusy(true);
    try {
      const { user: updated } = await adminApi.updateProfile(profile);
      setUser(updated);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.details?.[0]?.message || err.message);
    } finally {
      setBusy(false);
    }
  };

  const changePassword = async () => {
    if (pw.new_password !== pw.confirm) return toast.error('The two new passwords do not match');
    setBusy(true);
    try {
      await adminApi.changePassword({
        current_password: pw.current_password,
        new_password: pw.new_password,
      });
      toast.success('Password changed');
      setPw({ current_password: '', new_password: '', confirm: '' });
    } catch (err) {
      toast.error(err.details?.[0]?.message || err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="a-card" style={{ marginBottom: 18 }}>
        <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1rem', fontWeight: 500, marginBottom: 18 }}>
          Your profile
        </h3>
        <div className="a-grid-2">
          <Field label="Name">
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
            />
          </Field>
          <Field label="Email address">
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
            />
          </Field>
        </div>
        <button className="btn btn--sm" onClick={saveProfile} disabled={busy}>
          <Icon.save /> Save profile
        </button>
      </div>

      <div className="a-card">
        <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1rem', fontWeight: 500, marginBottom: 6 }}>
          Change password
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 20 }}>
          Do this straight away if you are still on the seeded default password.
        </p>

        <div className="a-grid-3">
          <Field label="Current password">
            <input
              type="password"
              value={pw.current_password}
              autoComplete="current-password"
              onChange={(e) => setPw((p) => ({ ...p, current_password: e.target.value }))}
            />
          </Field>
          <Field label="New password" hint="At least 8 characters">
            <input
              type="password"
              value={pw.new_password}
              autoComplete="new-password"
              onChange={(e) => setPw((p) => ({ ...p, new_password: e.target.value }))}
            />
          </Field>
          <Field label="Confirm new password">
            <input
              type="password"
              value={pw.confirm}
              autoComplete="new-password"
              onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))}
            />
          </Field>
        </div>

        <button className="btn btn--sm" onClick={changePassword} disabled={busy}>
          <Icon.shield /> Update password
        </button>
      </div>
    </>
  );
}
