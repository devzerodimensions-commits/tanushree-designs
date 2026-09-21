import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { adminApi } from '../lib/api.js';
import { useApi } from '../hooks/useApi.js';
import Icon from '../lib/icons.jsx';
import { AdminHeader } from './AdminLayout.jsx';
import { Confirm, EmptyState, Field, Modal, TableSkeleton, useToast } from './ui.jsx';

const STATUSES = ['new', 'contacted', 'quoted', 'won', 'closed'];

const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const when = (iso) =>
  new Date(iso).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

/** Estimates submitted through the public price calculator. */
export default function Quotes() {
  const { setOpen } = useOutletContext();
  const toast = useToast();

  const { data, loading, reload } = useApi(() => adminApi.calcQuotes(), []);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [viewing, setViewing] = useState(null);
  const [note, setNote] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  const counts = useMemo(() => {
    const list = data?.data ?? [];
    return list.reduce((acc, q) => {
      acc[q.status] = (acc[q.status] || 0) + 1;
      acc.all += 1;
      return acc;
    }, { all: 0 });
  }, [data]);

  const rows = useMemo(() => {
    let list = data?.data ?? [];
    if (status !== 'all') list = list.filter((q) => q.status === status);
    if (search.trim()) {
      const t = search.trim().toLowerCase();
      list = list.filter(
        (q) =>
          q.name.toLowerCase().includes(t) ||
          q.email.toLowerCase().includes(t) ||
          (q.phone || '').includes(t) ||
          (q.city || '').toLowerCase().includes(t)
      );
    }
    return list;
  }, [data, status, search]);

  const setQuoteStatus = async (row, next) => {
    try {
      await adminApi.updateCalcQuote(row.id, { status: next });
      toast.success(`Marked as ${next}`);
      reload();
      setViewing((v) => (v && v.id === row.id ? { ...v, status: next } : v));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const saveNote = async () => {
    try {
      await adminApi.updateCalcQuote(viewing.id, { admin_note: note });
      toast.success('Note saved');
      reload();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await adminApi.removeCalcQuote(deleting.id);
      toast.success('Estimate deleted');
      setDeleting(null);
      setViewing(null);
      reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const open = (row) => {
    setViewing(row);
    setNote(row.admin_note || '');
    if (row.status === 'new') setQuoteStatus(row, 'contacted');
  };

  return (
    <>
      <AdminHeader
        title="Calculator Estimates"
        subtitle="Everyone who completed the price calculator, and what they asked for"
        onMenu={() => setOpen(true)}
      >
        <button className="btn btn--ghost btn--sm" onClick={reload}>
          Refresh
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
              placeholder="Search name, email, phone or city"
            />
          </div>
          <div className="status-tabs">
            <button
              className={`status-tab${status === 'all' ? ' is-active' : ''}`}
              onClick={() => setStatus('all')}
            >
              All <b>{counts.all ?? 0}</b>
            </button>
            {STATUSES.map((s) => (
              <button
                key={s}
                className={`status-tab${status === s ? ' is-active' : ''}`}
                onClick={() => setStatus(s)}
              >
                {s} <b>{counts[s] ?? 0}</b>
              </button>
            ))}
          </div>
        </div>

        <div className="a-card a-card--flush">
          {loading ? (
            <TableSkeleton />
          ) : rows.length ? (
            <div className="a-table-wrap">
              <table className="a-table">
                <thead>
                  <tr>
                    <th>From</th>
                    <th style={{ width: 190 }}>Contact</th>
                    <th style={{ width: 180 }}>Kitchen</th>
                    <th style={{ width: 160 }}>Estimate</th>
                    <th style={{ width: 130 }}>Received</th>
                    <th style={{ width: 110 }}>Status</th>
                    <th style={{ width: 90, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((q) => (
                    <tr
                      key={q.id}
                      style={{ cursor: 'pointer', fontWeight: q.status === 'new' ? 500 : 400 }}
                      onClick={() => open(q)}
                    >
                      <td>
                        <b style={{ fontWeight: 500 }}>{q.name}</b>
                        {q.city && (
                          <div style={{ fontSize: '0.76rem', color: 'var(--muted-light)' }}>
                            {q.city}
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontSize: '0.82rem' }}>{q.email}</div>
                        {q.phone && (
                          <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{q.phone}</div>
                        )}
                      </td>
                      <td style={{ fontSize: '0.84rem' }}>
                        {q.layout_title || '—'}
                        <div style={{ fontSize: '0.76rem', color: 'var(--muted)' }}>
                          {q.package_title} · {Number(q.running_feet)} ft
                        </div>
                      </td>
                      <td>
                        {Number(q.estimate_high) > 0 ? (
                          <b style={{ fontWeight: 600 }}>
                            {money(q.estimate_low)} – {money(q.estimate_high)}
                          </b>
                        ) : (
                          <span className="chip chip--new">no rate set</span>
                        )}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                        {when(q.created_at)}
                      </td>
                      <td>
                        <span className={`chip chip--${q.status}`}>{q.status}</span>
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className="row-actions">
                          <a className="icon-btn" href={`mailto:${q.email}`} title="Reply by email">
                            <Icon.mail />
                          </a>
                          <button
                            className="icon-btn icon-btn--danger"
                            onClick={() => setDeleting(q)}
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
              icon="chart"
              title={search || status !== 'all' ? 'Nothing matches' : 'No estimates yet'}
              text="When someone completes the price calculator, their answers and the figure they were shown appear here."
            />
          )}
        </div>
      </div>

      {/* ---------------------------------------------------- detail */}
      <Modal
        open={Boolean(viewing)}
        title={viewing ? viewing.name : ''}
        onClose={() => setViewing(null)}
        footer={
          viewing && (
            <>
              <button className="btn btn--ghost btn--sm" onClick={saveNote}>
                <Icon.save /> Save note
              </button>
              <a className="btn btn--sm" href={`mailto:${viewing.email}`}>
                <Icon.mail /> Reply
              </a>
            </>
          )
        }
      >
        {viewing && (
          <>
            <div className="enquiry-meta">
              <div>
                <b>Email</b>
                <a href={`mailto:${viewing.email}`} style={{ color: 'var(--maroon)' }}>
                  {viewing.email}
                </a>
              </div>
              {viewing.phone && (
                <div>
                  <b>Phone</b>
                  <a href={`tel:${viewing.phone}`} style={{ color: 'var(--maroon)' }}>
                    {viewing.phone}
                  </a>
                </div>
              )}
              {viewing.city && (
                <div>
                  <b>City</b>
                  <span>{viewing.city}</span>
                </div>
              )}
              <div>
                <b>WhatsApp</b>
                <span>{viewing.whatsapp_ok ? 'Yes, happy to be messaged' : 'Not opted in'}</span>
              </div>
              <div>
                <b>Received</b>
                <span>{when(viewing.created_at)}</span>
              </div>
            </div>

            <div className="enquiry-message" style={{ whiteSpace: 'normal' }}>
              <div className="calc-summary" style={{ margin: 0 }}>
                <div>
                  <span>Layout</span>
                  <b>{viewing.layout_title || '—'}</b>
                </div>
                <div>
                  <span>Package</span>
                  <b>{viewing.package_title || '—'}</b>
                </div>
                <div>
                  <span>Running length</span>
                  <b>{Number(viewing.running_feet)} ft</b>
                </div>
                <div>
                  <span>Estimate shown</span>
                  <b>
                    {Number(viewing.estimate_high) > 0
                      ? `${money(viewing.estimate_low)} – ${money(viewing.estimate_high)}`
                      : 'None (rate not set)'}
                  </b>
                </div>
              </div>

              {viewing.breakdown?.addons?.length > 0 && (
                <p style={{ marginTop: 16, fontSize: '0.88rem' }}>
                  <b style={{ fontWeight: 600 }}>Extras requested:</b>{' '}
                  {viewing.breakdown.addons.map((a) => a.title).join(', ')}
                </p>
              )}

              {/* What this kitchen actually takes. The quantities come from
                  what was typed against the package, multiplied by the length
                  the visitor measured, so the answer is here rather than
                  worked out again by hand for every enquiry. */}
              {viewing.breakdown?.included?.length > 0 && (
                <div className="q-needs">
                  <h4>What this kitchen needs</h4>
                  <ul>
                    {viewing.breakdown.included.map((line) => (
                      <li key={line.name}>
                        <span>{line.name}</span>
                        <b>
                          {line.quantity} {line.unit}
                        </b>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {viewing.breakdown?.measured && (
                <p style={{ marginTop: 10, fontSize: '0.85rem', color: 'var(--muted)' }}>
                  Wall measurements:{' '}
                  {Object.entries(viewing.breakdown.measured)
                    .map(([k, v]) => `${k} = ${v} ft`)
                    .join(', ')}
                </p>
              )}
            </div>

            <div style={{ marginTop: 22 }}>
              <Field label="Status">
                <div className="status-tabs">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`status-tab${viewing.status === s ? ' is-active' : ''}`}
                      onClick={() => setQuoteStatus(viewing, s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Internal note" hint="Only visible to your team">
                <textarea
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Called on 19 Sep, site visit booked for Saturday…"
                />
              </Field>
            </div>
          </>
        )}
      </Modal>

      <Confirm
        open={Boolean(deleting)}
        title="Delete this estimate?"
        message="The visitor's details and their answers will be permanently removed."
        busy={busy}
        onCancel={() => setDeleting(null)}
        onConfirm={remove}
      />
    </>
  );
}
