import { Link, useOutletContext } from 'react-router-dom';
import { adminApi } from '../lib/api.js';
import { useApi } from '../hooks/useApi.js';
import Icon from '../lib/icons.jsx';
import { AdminHeader } from './AdminLayout.jsx';
import { EmptyState, TableSkeleton } from './ui.jsx';

const KPIS = [
  { key: 'enquiries_new', label: 'New enquiries', icon: 'inbox', to: '/admin/enquiries' },
  { key: 'quotes_new', label: 'New estimates', icon: 'chart', to: '/admin/quotes' },
  { key: 'services', label: 'Active services', icon: 'kitchen', to: '/admin/services' },
  { key: 'testimonials', label: 'Testimonials', icon: 'quote', to: '/admin/testimonials' },
  { key: 'layouts', label: 'Kitchen layouts', icon: 'layout', to: '/admin/kitchen-layouts' },
  { key: 'media', label: 'Media files', icon: 'image', to: '/admin/media' },
];

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export default function Dashboard() {
  const { setOpen } = useOutletContext();
  const { data, loading, error } = useApi(() => adminApi.dashboard(), []);

  const counts = data?.counts ?? {};
  const trend = data?.trend ?? [];
  const peak = Math.max(1, ...trend.map((t) => t.count));

  return (
    <>
      <AdminHeader
        title="Dashboard"
        subtitle="A quick read on your website and incoming enquiries"
        onMenu={() => setOpen(true)}
      >
        <Link className="btn btn--sm" to="/admin/enquiries">
          <Icon.inbox /> Enquiries
        </Link>
      </AdminHeader>

      <div className="admin-body">
        {error && (
          <div className="form-alert form-alert--err" style={{ marginBottom: 20 }}>
            <Icon.alert />
            <span>
              {error.message} — make sure the API is running and the database has been migrated and
              seeded.
            </span>
          </div>
        )}

        <div className="kpi-grid">
          {KPIS.map((k) => {
            const Glyph = Icon[k.icon];
            return (
              <Link className="kpi" to={k.to} key={k.key}>
                <span className="kpi__icon">
                  <Glyph />
                </span>
                <b>{loading ? '—' : (counts[k.key] ?? 0)}</b>
                <span className="kpi__label">{k.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="admin-cols">
          <div className="a-card a-card--flush">
            <div className="a-card__head">
              <h3>Enquiries — last 14 days</h3>
              <span className="chip chip--gold">{counts.enquiries ?? 0} all time</span>
            </div>

            {loading ? (
              <TableSkeleton rows={3} />
            ) : trend.length ? (
              <>
                <div className="chart">
                  {trend.map((d) => (
                    <div className="chart__bar" key={d.label}>
                      <div
                        className="chart__fill"
                        data-value={`${d.count} on ${d.label}`}
                        style={{ height: `${Math.max(3, (d.count / peak) * 100)}%` }}
                      />
                    </div>
                  ))}
                </div>
                <div className="chart__labels">
                  {trend.map((d, i) => (
                    <span key={d.label}>{i % 2 === 0 ? d.label.split(' ')[1] : ''}</span>
                  ))}
                </div>
              </>
            ) : (
              <EmptyState icon="chart" title="No enquiries yet" text="They will appear here as they arrive." />
            )}
          </div>

          <div className="a-card a-card--flush">
            <div className="a-card__head">
              <h3>Latest enquiries</h3>
              <Link className="link-arrow" to="/admin/enquiries" style={{ fontSize: '0.72rem' }}>
                View all <Icon.arrowRight />
              </Link>
            </div>

            {loading ? (
              <TableSkeleton rows={4} />
            ) : data?.recent_enquiries?.length ? (
              <div style={{ padding: 8 }}>
                {data.recent_enquiries.map((e) => (
                  <Link
                    key={e.id}
                    to="/admin/enquiries"
                    style={{
                      display: 'block',
                      padding: '13px 14px',
                      borderRadius: 10,
                      transition: 'background .2s',
                    }}
                    onMouseEnter={(ev) => (ev.currentTarget.style.background = '#faf8f7')}
                    onMouseLeave={(ev) => (ev.currentTarget.style.background = 'transparent')}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 12,
                        alignItems: 'center',
                      }}
                    >
                      <b style={{ fontWeight: 500, fontSize: '0.9rem' }}>
                        {e.first_name} {e.last_name || ''}
                      </b>
                      <span className={`chip chip--${e.status}`}>{e.status}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: 4 }}>
                      {e.subject || e.message.slice(0, 54)}…
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--muted-light)', marginTop: 4 }}>
                      {fmtDate(e.created_at)}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState icon="inbox" title="Inbox is empty" text="New website enquiries land here." />
            )}
          </div>
        </div>

        <div className="a-card" style={{ marginTop: 18 }}>
          <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1rem', fontWeight: 500, marginBottom: 6 }}>
            Quick actions
          </h3>
          <p style={{ fontSize: '0.86rem', color: 'var(--muted)', marginBottom: 18 }}>
            The things you will reach for most often.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <Link className="btn btn--ghost btn--sm" to="/admin/pages">
              <Icon.edit /> Edit page text
            </Link>
            <Link className="btn btn--ghost btn--sm" to="/admin/settings">
              <Icon.settings /> Brand & contact
            </Link>
            <Link className="btn btn--ghost btn--sm" to="/admin/media">
              <Icon.upload /> Upload images
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
