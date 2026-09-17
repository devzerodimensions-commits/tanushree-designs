import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { adminApi } from '../lib/api.js';
import { useScrollLock } from '../hooks/useApi.js';
import Icon from '../lib/icons.jsx';

/* =====================================================  toasts  ==== */
const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);

  const push = useCallback((message, type = 'ok') => {
    const id = Date.now() + Math.random();
    setItems((list) => [...list, { id, message, type }]);
    setTimeout(() => setItems((list) => list.filter((t) => t.id !== id)), 4200);
  }, []);

  const api = {
    success: (m) => push(m, 'ok'),
    error: (m) => push(m, 'err'),
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast-stack">
        <AnimatePresence>
          {items.map((t) => (
            <motion.div
              key={t.id}
              className={`toast toast--${t.type}`}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.25 }}
            >
              {t.type === 'ok' ? <Icon.checkCircle /> : <Icon.alert />}
              <span>{t.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext) ?? { success: () => {}, error: () => {} };

/* ======================================================  modal  ==== */
export function Modal({ open, title, onClose, children, footer, size = '' }) {
  useScrollLock(open);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-scrim"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            className={`modal ${size ? `modal--${size}` : ''}`}
            initial={{ opacity: 0, y: 22, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="modal__head">
              <h3>{title}</h3>
              <button className="modal__close" onClick={onClose} aria-label="Close">
                <Icon.close style={{ width: 17, height: 17 }} />
              </button>
            </div>
            <div className="modal__body">{children}</div>
            {footer && <div className="modal__foot">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Confirm before a destructive action. */
export function Confirm({ open, title, message, confirmLabel = 'Delete', onConfirm, onCancel, busy }) {
  return (
    <Modal
      open={open}
      title={title || 'Are you sure?'}
      onClose={onCancel}
      size="sm"
      footer={
        <>
          <button className="btn btn--ghost btn--sm" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button
            className="btn btn--sm"
            style={{ '--btn-bg': '#c0392b' }}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? <span className="spinner" /> : null}
            {confirmLabel}
          </button>
        </>
      }
    >
      <p style={{ color: 'var(--muted)', fontSize: '0.92rem' }}>
        {message || 'This cannot be undone.'}
      </p>
    </Modal>
  );
}

/* =====================================================  fields  ==== */
export function Field({ label, required, hint, children, full }) {
  return (
    <div className="a-field" style={full ? { gridColumn: '1 / -1' } : undefined}>
      {label && (
        <label>
          {label} {required && <span>*</span>}
        </label>
      )}
      {children}
      {hint && <small>{hint}</small>}
    </div>
  );
}

export function Switch({ checked, onChange, label }) {
  return (
    <label className="a-switch">
      <input type="checkbox" checked={Boolean(checked)} onChange={(e) => onChange(e.target.checked)} />
      <i />
      <span>{label}</span>
    </label>
  );
}

/** Editable list of short strings (features, highlights…). */
export function ListEditor({ value = [], onChange, placeholder = 'Add an item' }) {
  const list = Array.isArray(value) ? value : [];

  const update = (i, v) => onChange(list.map((x, idx) => (idx === i ? v : x)));
  const remove = (i) => onChange(list.filter((_, idx) => idx !== i));

  return (
    <div>
      {list.map((item, i) => (
        <div className="repeat-row" key={i}>
          <input type="text" value={item} onChange={(e) => update(i, e.target.value)} />
          <button type="button" className="icon-btn icon-btn--danger" onClick={() => remove(i)} aria-label="Remove">
            <Icon.trash />
          </button>
        </div>
      ))}
      <button type="button" className="btn btn--ghost btn--sm" onClick={() => onChange([...list, ''])}>
        <Icon.plus /> {placeholder}
      </button>
    </div>
  );
}

/* ================================================  image picker  ==== */
/**
 * Image field that accepts a direct URL, a device upload, or a pick from
 * the media library. Everything resolves to a plain URL string.
 */
export function ImagePicker({ value, onChange, folder = 'general' }) {
  const [busy, setBusy] = useState(false);
  const [libOpen, setLibOpen] = useState(false);
  const fileRef = useRef(null);
  const toast = useToast();

  const upload = async (files) => {
    if (!files?.length) return;
    setBusy(true);
    try {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append('files', f));
      fd.append('folder', folder);
      const { data } = await adminApi.uploadMedia(fd);
      if (data?.[0]?.url) onChange(data[0].url);
      toast.success('Image uploaded');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="img-picker">
        <div className="img-picker__preview">
          {value ? <img src={value} alt="" /> : <Icon.image />}
        </div>
        <div className="img-picker__side">
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Paste an image URL, or upload below"
          />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => fileRef.current?.click()}
              disabled={busy}
            >
              {busy ? <span className="spinner spinner--dark" /> : <Icon.upload />}
              Upload
            </button>
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => setLibOpen(true)}>
              <Icon.grid /> Library
            </button>
            {value && (
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => onChange('')}>
                Clear
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => upload(e.target.files)}
          />
        </div>
      </div>

      <MediaLibraryModal
        open={libOpen}
        onClose={() => setLibOpen(false)}
        onPick={(url) => {
          onChange(url);
          setLibOpen(false);
        }}
      />
    </>
  );
}

/** Multi-image gallery editor used by the project form. */
export function GalleryPicker({ value = [], onChange, folder = 'projects' }) {
  const [libOpen, setLibOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);
  const toast = useToast();

  const urls = (Array.isArray(value) ? value : []).map((v) =>
    typeof v === 'string' ? v : v.image_url
  );

  const upload = async (files) => {
    if (!files?.length) return;
    setBusy(true);
    try {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append('files', f));
      fd.append('folder', folder);
      const { data } = await adminApi.uploadMedia(fd);
      onChange([...urls, ...data.map((d) => d.url)]);
      toast.success(`${data.length} image(s) added`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
        >
          {busy ? <span className="spinner spinner--dark" /> : <Icon.upload />}
          Upload images
        </button>
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => setLibOpen(true)}>
          <Icon.grid /> From library
        </button>
      </div>

      <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => upload(e.target.files)} />

      <div className="gallery-strip">
        {urls.map((url, i) => (
          <div className="gallery-tile" key={url + i}>
            <img src={url} alt="" />
            <button
              type="button"
              className="gallery-tile__x"
              onClick={() => onChange(urls.filter((_, idx) => idx !== i))}
              aria-label="Remove image"
            >
              ×
            </button>
          </div>
        ))}
        <button type="button" className="gallery-tile gallery-tile--add" onClick={() => setLibOpen(true)}>
          <Icon.plus />
        </button>
      </div>

      <MediaLibraryModal
        open={libOpen}
        multi
        onClose={() => setLibOpen(false)}
        onPickMany={(picked) => {
          onChange([...urls, ...picked]);
          setLibOpen(false);
        }}
      />
    </>
  );
}

/* ==============================================  media library  ==== */
export function MediaLibraryModal({ open, onClose, onPick, onPickMany, multi = false }) {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (!open) return;
    setSelected([]);
    setLoading(true);
    adminApi
      .media()
      .then(({ data }) => setItems(data))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const toggle = (url) => {
    if (!multi) return onPick?.(url);
    setSelected((s) => (s.includes(url) ? s.filter((x) => x !== url) : [...s, url]));
  };

  return (
    <Modal
      open={open}
      title="Media library"
      onClose={onClose}
      size="wide"
      footer={
        multi ? (
          <>
            <button className="btn btn--ghost btn--sm" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn btn--sm"
              onClick={() => onPickMany?.(selected)}
              disabled={!selected.length}
            >
              Add {selected.length || ''} image{selected.length === 1 ? '' : 's'}
            </button>
          </>
        ) : null
      }
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <span className="spinner spinner--dark" />
        </div>
      ) : items.length ? (
        <div className="media-grid">
          {items.map((m) => (
            <button
              key={m.id}
              type="button"
              className={`media-item${selected.includes(m.url) ? ' is-selected' : ''}`}
              onClick={() => toggle(m.url)}
            >
              <div className="media-item__img">
                <img src={m.url} alt={m.alt_text || ''} loading="lazy" />
              </div>
              <div className="media-item__meta">
                <b>{m.alt_text || m.filename}</b>
                <small>{m.folder}</small>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="a-empty">
          <Icon.image />
          <p>Nothing in the library yet. Upload images from the Media page or straight from a form.</p>
        </div>
      )}
    </Modal>
  );
}

/* ====================================================  helpers  ==== */
export function StatusChip({ active }) {
  return <span className={`chip chip--${active ? 'live' : 'off'}`}>{active ? 'Live' : 'Hidden'}</span>;
}

export function EmptyState({ icon = 'file', title, text, action }) {
  const Glyph = Icon[icon] || Icon.file;
  return (
    <div className="a-empty">
      <Glyph />
      <h4 style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, marginBottom: 7 }}>{title}</h4>
      <p style={{ fontSize: '0.9rem', maxWidth: '44ch', marginInline: 'auto' }}>{text}</p>
      {action && <div style={{ marginTop: 20 }}>{action}</div>}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div style={{ padding: 18, display: 'grid', gap: 10 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height: 46 }} />
      ))}
    </div>
  );
}
