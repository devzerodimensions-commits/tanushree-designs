import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Small data-fetching hook: runs `fn` on mount (and whenever `deps` change),
 * tracks loading/error, and exposes a manual `reload`.
 */
export function useApi(fn, deps = [], { initial = null, skip = false } = {}) {
  const [data, setData] = useState(initial);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState(null);
  const alive = useRef(true);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fnRef.current();
      if (alive.current) setData(result);
      return result;
    } catch (err) {
      if (alive.current) setError(err);
      return null;
    } finally {
      if (alive.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    alive.current = true;
    if (!skip) run();
    return () => {
      alive.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, skip]);

  return { data, loading, error, reload: run, setData };
}

/** Lock body scroll while a modal / drawer is open. */
export function useScrollLock(active) {
  useEffect(() => {
    if (!active) return undefined;
    document.body.classList.add('is-locked');
    return () => document.body.classList.remove('is-locked');
  }, [active]);
}

/** Fire a callback on Escape. */
export function useEscape(handler, active = true) {
  useEffect(() => {
    if (!active) return undefined;
    const onKey = (e) => e.key === 'Escape' && handler();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handler, active]);
}

/** Count up to a number once the element scrolls into view. */
export function useCountUp(target, duration = 1600) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  const done = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || done.current) return;
        done.current = true;

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          setValue(target);
          return;
        }

        const start = performance.now();
        const tick = (now) => {
          const p = Math.min((now - start) / duration, 1);
          // easeOutExpo
          const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
          setValue(Math.round(target * eased));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [target, duration]);

  return [value, ref];
}
