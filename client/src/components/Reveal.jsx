import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const VARIANTS = {
  up: { y: 34, opacity: 0 },
  down: { y: -28, opacity: 0 },
  left: { x: 40, opacity: 0 },
  right: { x: -40, opacity: 0 },
  fade: { opacity: 0 },
  scale: { scale: 0.94, opacity: 0 },
};

const SHOWN = { x: 0, y: 0, scale: 1, opacity: 1 };

/** How far inside the viewport an element must come before it is revealed. */
const MARGIN = 60;

/* ------------------------------------------------------------------------
   One shared watcher for every pending reveal.

   Two things are going on here. The first is cost: a scroll handler per
   Reveal meant dozens of listeners all measuring on the same frame. The
   second is correctness. These sections mount before their content has been
   fetched, so an observer is often attached to a box with no height, and a
   zero-area target can keep reporting "not intersecting" even after the data
   fills it out. In some embedded browsers the callback never arrives at all.
   Either way the section stayed at opacity 0 and the only way to see it was
   to reload the page.

   So the position check is the source of truth and runs on mount, on scroll,
   on resize and whenever an element changes size. IntersectionObserver is
   kept as an optimisation on top, never as the only path.
   ------------------------------------------------------------------------ */
const pending = new Map(); // node -> reveal callback
let scheduled = false;
let listening = false;

function isOnScreen(node) {
  const r = node.getBoundingClientRect();
  if (r.width === 0 && r.height === 0) return false;
  const h = window.innerHeight || document.documentElement.clientHeight;
  return r.top < h - MARGIN && r.bottom > MARGIN;
}

function sweep() {
  scheduled = false;
  for (const [node, show] of pending) {
    if (isOnScreen(node)) {
      pending.delete(node);
      show();
    }
  }
  if (pending.size === 0) stopListening();
}

function scheduleSweep() {
  if (scheduled) return;
  scheduled = true;
  // setTimeout rather than requestAnimationFrame: a tab in the background
  // stops painting, which pauses rAF entirely. The sweep would then never
  // run, and a section whose data arrived while the tab was hidden would
  // still be invisible when the visitor came back to it.
  setTimeout(sweep, 0);
}

const sizeWatcher =
  typeof ResizeObserver !== 'undefined' ? new ResizeObserver(scheduleSweep) : null;

function startListening() {
  if (listening) return;
  listening = true;
  window.addEventListener('scroll', scheduleSweep, { passive: true });
  window.addEventListener('resize', scheduleSweep, { passive: true });
}

function stopListening() {
  if (!listening) return;
  listening = false;
  window.removeEventListener('scroll', scheduleSweep);
  window.removeEventListener('resize', scheduleSweep);
}

function watch(node, show) {
  pending.set(node, show);
  sizeWatcher?.observe(node);
  startListening();
  return () => {
    pending.delete(node);
    sizeWatcher?.unobserve(node);
    if (pending.size === 0) stopListening();
  };
}

/** True once the element has come into view. Never gets stuck hidden. */
function useSeen(ref) {
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    if (seen) return undefined;
    const node = ref.current;

    // No node to measure: show the content rather than hide it forever.
    if (!node) {
      setSeen(true);
      return undefined;
    }

    // Already on screen when it mounted — the common case above the fold.
    if (isOnScreen(node)) {
      setSeen(true);
      return undefined;
    }

    return watch(node, () => setSeen(true));
  }, [seen, ref]);

  return seen;
}

/** Scroll-triggered entrance. Runs once, respects reduced-motion via framer. */
export default function Reveal({
  children,
  from = 'up',
  delay = 0,
  duration = 0.7,
  className,
  as = 'div',
  ...rest
}) {
  const MotionTag = motion[as] || motion.div;
  const ref = useRef(null);
  const seen = useSeen(ref);
  const hidden = VARIANTS[from] ?? VARIANTS.up;

  return (
    <MotionTag
      ref={ref}
      className={className}
      initial={hidden}
      // Always a concrete target. Passing `undefined` while hidden leaves the
      // element with nothing to animate towards, and it can stay at `initial`
      // — invisible — even after it has been seen.
      animate={seen ? SHOWN : hidden}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}

/** Staggers its direct children as they enter the viewport. */
export function RevealGroup({ children, className, stagger = 0.09, ...rest }) {
  const ref = useRef(null);
  const seen = useSeen(ref);

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={seen ? 'show' : 'hidden'}
      variants={{ show: { transition: { staggerChildren: stagger } } }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({ children, className, from = 'up', ...rest }) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: VARIANTS[from] ?? VARIANTS.up,
        show: { ...SHOWN, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
      }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
