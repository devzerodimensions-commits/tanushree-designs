import { useMemo, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { adminApi } from '../lib/api.js';
import { useApi } from '../hooks/useApi.js';
import Icon from '../lib/icons.jsx';
import { AdminHeader } from './AdminLayout.jsx';
import { Confirm, EmptyState, Field, Modal, useToast } from './ui.jsx';

const FOLDERS = ['general', 'projects', 'services', 'kitchen-layouts', 'materials', 'team', 'testimonials'];

const size = (bytes) => {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

export default function Media() {
  const { setOpen } = useOutletContext();
  const toast = useToast();
  const fileRef = useRef(null);

  const { data, loading, reload } = useApi(() => adminApi.media(), []);
  const [folder, setFolder] = useState('all');
  const [uploadFolder, setUploadFolder] = useState('general');
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [busyDelete, setBusyDelete] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  const items = useMemo(() => {
    const list = data?.data ?? [];
    return folder === 'all' ? list : list.filter((m) => m.folder === folder);
  }, [data, folder]);

  const upload = async (files) => {
    if (!files?.length) return;
    setBusy(true);
    try {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append('files', f));
      fd.append('folder', uploadFolder);
      const { data: saved } = await adminApi.uploadMedia(fd);
      toast.success(`${saved.length} image${saved.length === 1 ? '' : 's'} uploaded`);
      reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const addLink = async () => {
    if (!linkUrl.trim()) return;
    try {
      await adminApi.linkMedia({ url: linkUrl.trim(), folder: uploadFolder });
      toast.success('Image added to the library');
      setLinkUrl('');
      setLinkOpen(false);
      reload();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const remove = async () => {
    setBusyDelete(true);
    try {
      await adminApi.removeMedia(deleting.id);
      toast.success('Image deleted');
      setDeleting(null);
      reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyDelete(false);
    }
  };

  const copy = (url) => {
    navigator.clipboard?.writeText(url);
    toast.success('Image URL copied');
  };

  return (
    <>
      <AdminHeader
        title="Media Library"
        subtitle="Every image used across the website, in one place"
        onMenu={() => setOpen(true)}
      >
        <button className="btn btn--ghost btn--sm" onClick={() => setLinkOpen(true)}>
          <Icon.external /> Add by URL
        </button>
        <button className="btn btn--sm" onClick={() => fileRef.current?.click()} disabled={busy}>
          {busy ? <span className="spinner" /> : <Icon.upload />} Upload
        </button>
      </AdminHeader>

      <div className="admin-body">
        <div
          className={`dropzone${over ? ' is-over' : ''}`}
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setOver(true);
          }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setOver(false);
            upload(e.dataTransfer.files);
          }}
        >
          <Icon.upload />
          <b>Drop images here, or click to browse</b>
          <small>JPG, PNG, WEBP, AVIF or SVG — up to 8 MB each, 20 at a time</small>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => upload(e.target.files)}
        />

        <div className="a-toolbar">
          <div className="seg">
            <button className={folder === 'all' ? 'is-active' : ''} onClick={() => setFolder('all')}>
              All ({data?.data?.length ?? 0})
            </button>
            {FOLDERS.map((f) => (
              <button key={f} className={folder === f ? 'is-active' : ''} onClick={() => setFolder(f)}>
                {f}
              </button>
            ))}
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 9 }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>Upload into</span>
            <select
              value={uploadFolder}
              onChange={(e) => setUploadFolder(e.target.value)}
              style={{
                padding: '8px 11px',
                border: '1px solid var(--admin-line)',
                borderRadius: 9,
                background: '#fff',
                fontSize: '0.85rem',
              }}
            >
              {FOLDERS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="a-card">
          {loading ? (
            <div className="media-grid">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ aspectRatio: '4/3', borderRadius: 11 }} />
              ))}
            </div>
          ) : items.length ? (
            <div className="media-grid">
              {items.map((m) => (
                <div className="media-item" key={m.id} onClick={() => copy(m.url)} title="Click to copy URL">
                  <button
                    className="media-item__del"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleting(m);
                    }}
                    aria-label="Delete image"
                  >
                    <Icon.trash />
                  </button>
                  <div className="media-item__img">
                    <img src={m.url} alt={m.alt_text || ''} loading="lazy" />
                  </div>
                  <div className="media-item__meta">
                    <b>{m.alt_text || m.filename}</b>
                    <small>
                      {m.folder} · {size(m.size_bytes)}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon="image"
              title="No images here yet"
              text="Upload photographs of your kitchens and interiors, then pick them from any content form."
            />
          )}
        </div>
      </div>

      <Modal
        open={linkOpen}
        title="Add an image by URL"
        onClose={() => setLinkOpen(false)}
        size="sm"
        footer={
          <>
            <button className="btn btn--ghost btn--sm" onClick={() => setLinkOpen(false)}>
              Cancel
            </button>
            <button className="btn btn--sm" onClick={addLink}>
              Add to library
            </button>
          </>
        }
      >
        <Field label="Image URL" hint="Useful for images already hosted on a CDN">
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://…"
          />
        </Field>
      </Modal>

      <Confirm
        open={Boolean(deleting)}
        title="Delete this image?"
        message="It will be removed from the library and from disk. Anything currently using it will show a broken image."
        busy={busyDelete}
        onCancel={() => setDeleting(null)}
        onConfirm={remove}
      />
    </>
  );
}
