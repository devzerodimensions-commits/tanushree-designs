import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { adminApi } from '../lib/api.js';
import { useApi } from '../hooks/useApi.js';
import Icon from '../lib/icons.jsx';
import { AdminHeader } from './AdminLayout.jsx';
import { Confirm, EmptyState, Field, Modal, TableSkeleton, useToast } from './ui.jsx';

const STATUSES = ['new', 'contacted', 'quoted', 'won', 'closed'];

const fmt = (iso) =>
  new Date(iso).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

export default function Enquiries() {
  const { setOpen } = useOutletContext();
  const toast = useToast();

  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const { data, loading, reload } = useApi(() => adminApi.enquiries(), []);

  const [viewing, setViewing] = useState(null);
  const [note, setNote] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [busyDelete, setBusyDelete] = useState(false);

  const counts = useMemo(() => {
    const list = data?.data ?? [];
    return list.reduce(
      (acc, e) => {
        acc[e.status] = (acc[e.status] || 0) + 1;
        acc.all += 1;
        return acc;
      },
      { all: 0 }
    );
  }, [data]);

  const rows = useMemo(() => {
    let list = data?.data ?? [];
    if (status !== 'all') list = list.filter((e) => e.status === status);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (e) =>
          `${e.first_name} ${e.last_name ?? ''}`.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          (e.phone || '').includes(q) ||
          e.message.toLowerCase().includes(q)
      );
    }
    return list;
  }, [data, status, search]);

  const setEnquiryStatus = async (row, next) => {
    try {
      await adminApi.updateEnquiry(row.id, { status: next });
      toast.success(`Marked as ${next}`);
      reload();
      if (viewing?.id === row.id) setViewing({ ...viewing, status: next });
    } catch (err) {
      toast.error(err.message);
    }
  };

  const saveNote = async () => {
    try {
      await adminApi.updateEnquiry(viewing.id, { admin_note: note });
      toast.success('Note saved');
      reload();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const remove = async () => {
    setBusyDelete(true);
    try {
      await adminApi.removeEnquiry(deleting.id);
      toast.success('Enquiry deleted');
      setDeleting(null);
      setViewing(null);
      reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyDelete(false);
    }
  };

  const open = (row) => {
    setViewing(row);
    setNote(row.admin_note || '');
    if (row.status === 'new') setEnquiryStatus(row, 'contacted');
  };

  return (
    <>
      <AdminHeader
        title="Enquiries"
        subtitle="Every message sent through the website contact forms"
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
              placeholder="Search name, email, phone or message"
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
                    <th style={{ width: 200 }}>Contact</th>
                    <th>Message</th>
                    <th style={{ width: 130 }}>Received</th>
                    <th style={{ width: 120 }}>Status</th>
                    <th style={{ width: 110, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((e) => (
                    <tr
                      key={e.id}
                      style={{ cursor: 'pointer', fontWeight: e.status === 'new' ? 500 : 400 }}
                      onClick={() => open(e)}
                    >
                      <td>
                        <b style={{ fontWeight: 500 }}>
                          {e.first_name} {e.last_name || ''}
                        </b>
                        {e.subject && (
                          <div style={{ fontSize: '0.76rem', color: 'var(--muted-light)' }}>
                            {e.subject}
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontSize: '0.82rem' }}>{e.email}</div>
                        {e.phone && (
                          <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{e.phone}</div>
                        )}
                      </td>
                      <td style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
                        {e.message.slice(0, 68)}
                        {e.message.length > 68 ? '…' : ''}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                        {fmt(e.created_at)}
                      </td>
                      <td>
                        <span className={`chip chip--${e.status}`}>{e.status}</span>
                      </td>
                      <td onClick={(ev) => ev.stopPropagation()}>
                        <div className="row-actions">
                          <a className="icon-btn" href={`mailto:${e.email}`} title="Reply by email">
                            <Icon.mail />
                          </a>
                          <button
                            className="icon-btn icon-btn--danger"
                            onClick={() => setDeleting(e)}
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
              icon="inbox"
              title={search || status !== 'all' ? 'Nothing matches' : 'No enquiries yet'}
              text="Messages sent through the website contact forms land here."
            />
          )}
        </div>
      </div>

      {/* ------------------------------------------------ detail view */}
      <Modal
        open={Boolean(viewing)}
        title={viewing ? `${viewing.first_name} ${viewing.last_name || ''}` : ''}
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
              {viewing.subject && (
                <div>
                  <b>Interested in</b>
                  <span>{viewing.subject}</span>
                </div>
              )}
              <div>
                <b>Received</b>
                <span>{fmt(viewing.created_at)}</span>
              </div>
              <div>
                <b>From page</b>
                <span>{viewing.source_page}</span>
              </div>
            </div>

            <div className="enquiry-message">{viewing.message}</div>

            <div style={{ marginTop: 22 }}>
              <Field label="Status">
                <div className="status-tabs">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`status-tab${viewing.status === s ? ' is-active' : ''}`}
                      onClick={() => setEnquiryStatus(viewing, s)}
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
                  placeholder="Quoted ₹2.4L on 12 Sep, site visit booked for Saturday…"
                />
              </Field>
            </div>
          </>
        )}
      </Modal>

      <Confirm
        open={Boolean(deleting)}
        title="Delete this enquiry?"
        message="The message will be permanently removed from your inbox."
        busy={busyDelete}
        onCancel={() => setDeleting(null)}
        onConfirm={remove}
      />
    </>
  );
}
