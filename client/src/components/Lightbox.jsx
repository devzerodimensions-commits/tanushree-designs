import { useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useScrollLock } from '../hooks/useApi.js';
import Icon from '../lib/icons.jsx';

export default function Lightbox({ images = [], index, onClose, onChange }) {
  const open = index !== null && index !== undefined;
  useScrollLock(open);

  const step = useCallback(
    (delta) => {
      if (!images.length) return;
      onChange(((index + delta) % images.length + images.length) % images.length);
    },
    [index, images.length, onChange]
  );

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, step]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="lightbox"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Project image"
        >
          <motion.img
            key={index}
            src={images[index]}
            alt=""
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          />

          <button className="lightbox__close" onClick={onClose} aria-label="Close">
            <Icon.close style={{ width: 20, height: 20 }} />
          </button>

          {images.length > 1 && (
            <>
              <button
                className="lightbox__nav lightbox__nav--prev"
                onClick={(e) => {
                  e.stopPropagation();
                  step(-1);
                }}
                aria-label="Previous image"
              >
                <Icon.arrowLeft style={{ width: 19, height: 19 }} />
              </button>
              <button
                className="lightbox__nav lightbox__nav--next"
                onClick={(e) => {
                  e.stopPropagation();
                  step(1);
                }}
                aria-label="Next image"
              >
                <Icon.arrowRight style={{ width: 19, height: 19 }} />
              </button>
              <div className="lightbox__count">
                {index + 1} / {images.length}
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
