import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useSite } from '../context/SiteContext.jsx';
import Icon from '../lib/icons.jsx';

/** Jump to the top of the page whenever the route changes. */
export function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }, [pathname]);
  return null;
}

export default function FloatingActions() {
  const { contact } = useSite();
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 700);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="float-stack">
      <AnimatePresence>
        {showTop && (
          <motion.button
            className="float-btn float-btn--top"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            aria-label="Back to top"
          >
            <Icon.arrowUp />
          </motion.button>
        )}
      </AnimatePresence>

      <a
        className="float-btn float-btn--call"
        href={`tel:${contact.phone_raw || contact.phone}`}
        aria-label={`Call ${contact.phone}`}
      >
        <Icon.phone style={{ width: 21, height: 21 }} />
      </a>

      <a
        className="float-btn float-btn--wa"
        href={`https://wa.me/${contact.whatsapp}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat on WhatsApp"
      >
        <Icon.whatsapp />
      </a>
    </div>
  );
}
