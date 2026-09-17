import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Icon from '../lib/icons.jsx';

export default function Faq({ items = [] }) {
  const [open, setOpen] = useState(items.length ? 0 : null);

  if (!items.length) return null;

  return (
    <div className="faq-list">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div className={`faq-item${isOpen ? ' is-open' : ''}`} key={item.id ?? i}>
            <button
              type="button"
              className="faq-q"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
            >
              <span>{item.question}</span>
              <span className="faq-icon" aria-hidden="true">
                <Icon.plus />
              </span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  className="faq-a"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
                >
                  <p>{item.answer}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
