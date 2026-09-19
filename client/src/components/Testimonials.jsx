import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Icon from '../lib/icons.jsx';
import Img from './Img.jsx';

const EASE = [0.22, 1, 0.36, 1];

/**
 * Editorial testimonial section.
 *
 * A review means more when you can see the room it is about, so each one is
 * shown beside the project it came from, with a link through to that project.
 * Navigation is the clients' own faces rather than anonymous dots, and the
 * active face carries the autoplay progress.
 */
export default function Testimonials({ items = [], autoplay = 9000, tone = 'light' }) {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);
  const wrapRef = useRef(null);

  const count = items.length;

  const go = useCallback(
    (next, direction) => {
      if (!count) return;
      const target = ((next % count) + count) % count;
      setDir(direction ?? (target > index ? 1 : -1));
      setIndex(target);
    },
    [count, index]
  );

  useEffect(() => {
    if (!autoplay || count < 2 || paused) return undefined;
    const id = setTimeout(() => go(index + 1, 1), autoplay);
    return () => clearTimeout(id);
  }, [index, autoplay, count, paused, go]);

  // Arrow-key support when the section has focus.
  useEffect(() => {
    const node = wrapRef.current;
    if (!node) return undefined;
    const onKey = (e) => {
      if (e.key === 'ArrowRight') go(index + 1, 1);
      if (e.key === 'ArrowLeft') go(index - 1, -1);
    };
    node.addEventListener('keydown', onKey);
    return () => node.removeEventListener('keydown', onKey);
  }, [go, index]);

  if (!count) return null;
  const item = items[index];
  const hasPhoto = Boolean(item.project_image);

  const slide = {
    enter: (d) => ({ opacity: 0, y: 26, x: d * 18 }),
    center: { opacity: 1, y: 0, x: 0 },
    exit: (d) => ({ opacity: 0, y: -18, x: d * -18 }),
  };

  return (
    <div
      className={`tmo tmo--${tone}`}
      ref={wrapRef}
      tabIndex={-1}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className={`tmo__stage${hasPhoto ? '' : ' tmo__stage--solo'}`}>
        {/* ---------------------------------------------- project photo */}
        {hasPhoto && (
          <div className="tmo__media">
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={item.id ?? index}
                className="tmo__media-inner"
                custom={dir}
                initial={{ opacity: 0, scale: 1.06 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.6, ease: EASE }}
              >
                <Img
                  src={item.project_image}
                  alt={item.project_title || ''}
                  sizes="(max-width: 900px) 100vw, 40vw"
                />
              </motion.div>
            </AnimatePresence>

            {item.project_title && (
              <div className="tmo__project">
                <span className="tmo__project-label">Their project</span>
                <span className="tmo__project-title">{item.project_title}</span>
              </div>
            )}
          </div>
        )}

        {/* ---------------------------------------------------- the quote */}
        <div className="tmo__body">
          <span className="tmo__mark" aria-hidden="true">
            &ldquo;
          </span>

          <AnimatePresence mode="wait" custom={dir}>
            <motion.blockquote
              key={item.id ?? index}
              custom={dir}
              variants={slide}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.45, ease: EASE }}
            >
              <div className="tmo__stars" aria-label={`${item.rating || 5} out of 5`}>
                {Array.from({ length: item.rating || 5 }).map((_, i) => (
                  <Icon.star key={i} />
                ))}
              </div>

              <p className="tmo__text">{item.message}</p>

              <footer className="tmo__by">
                <span className="tmo__by-rule" aria-hidden="true" />
                <div>
                  <cite className="tmo__name">{item.name}</cite>
                  {(item.role || item.location) && (
                    <span className="tmo__loc">{item.role || item.location}</span>
                  )}
                </div>
              </footer>
            </motion.blockquote>
          </AnimatePresence>
        </div>
      </div>

      {/* ------------------------------------------------- face navigation */}
      {count > 1 && (
        <div className="tmo__nav">
          <button
            type="button"
            className="tmo__arrow"
            onClick={() => go(index - 1, -1)}
            aria-label="Previous testimonial"
          >
            <Icon.arrowLeft />
          </button>

          <ul className="tmo__faces">
            {items.map((t, i) => (
              <li key={t.id ?? i}>
                <button
                  type="button"
                  className={`tmo__face${i === index ? ' is-active' : ''}`}
                  onClick={() => go(i)}
                  aria-label={`Read the review from ${t.name}`}
                  aria-current={i === index}
                  title={t.name}
                >
                  {t.avatar_url ? (
                    <img src={t.avatar_url} alt="" loading="lazy" decoding="async" />
                  ) : (
                    <span className="tmo__initials">{t.name.charAt(0)}</span>
                  )}
                  {i === index && autoplay && !paused && (
                    <svg className="tmo__ring" viewBox="0 0 44 44" aria-hidden="true">
                      <circle
                        cx="22"
                        cy="22"
                        r="20.5"
                        style={{ animationDuration: `${autoplay}ms` }}
                      />
                    </svg>
                  )}
                </button>
              </li>
            ))}
          </ul>

          <button
            type="button"
            className="tmo__arrow"
            onClick={() => go(index + 1, 1)}
            aria-label="Next testimonial"
          >
            <Icon.arrowRight />
          </button>

          <span className="tmo__count">
            <b>{String(index + 1).padStart(2, '0')}</b>
            <i />
            {String(count).padStart(2, '0')}
          </span>
        </div>
      )}
    </div>
  );
}
