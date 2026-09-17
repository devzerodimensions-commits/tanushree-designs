import { useEffect, useMemo, useRef, useState } from 'react';
import Icon from '../lib/icons.jsx';

const WIDTHS = [400, 640, 900, 1200, 1600];

/**
 * Build a srcset for images served by a CDN that takes `w`/`h` query params
 * (Unsplash, and our own /uploads passthrough ignores them harmlessly).
 * A phone then downloads a 400px file instead of a 1200px one.
 */
function buildSrcSet(src) {
  if (!src || !src.includes('images.unsplash.com')) return undefined;
  try {
    const url = new URL(src);
    const baseW = Number(url.searchParams.get('w')) || 1200;
    const baseH = Number(url.searchParams.get('h')) || 0;
    const ratio = baseH ? baseH / baseW : 0;

    // Include the image's own width so large screens still get full quality.
    const candidates = [...new Set([...WIDTHS, baseW])].sort((a, b) => a - b);

    return candidates
      .filter((w) => w <= baseW)
      .map((w) => {
        const u = new URL(src);
        u.searchParams.set('w', String(w));
        if (ratio) u.searchParams.set('h', String(Math.round(w * ratio)));
        return `${u.toString()} ${w}w`;
      })
      .join(', ');
  } catch {
    return undefined;
  }
}

/**
 * Image that always looks deliberate:
 *  - holds its space via `ratio`, so nothing jumps while loading
 *  - shows a shimmer until the file arrives, then fades it in
 *  - falls back to a branded placeholder only on a genuine load failure
 *
 * `src` frequently starts out undefined because page content is fetched,
 * so the state resets whenever it changes — an empty src keeps the shimmer
 * rather than flashing an error.
 */
export default function Img({
  src,
  alt = '',
  ratio,
  className = '',
  fit = 'cover',
  position = 'center',
  eager = false,
  sizes = '(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw',
  ...rest
}) {
  const [state, setState] = useState(src ? 'loading' : 'empty');
  const lastSrc = useRef(src);
  const srcSet = useMemo(() => buildSrcSet(src), [src]);

  // Only rewind to "loading" when the source genuinely changes, otherwise a
  // re-render would undo a load that has already completed.
  useEffect(() => {
    if (lastSrc.current !== src) {
      lastSrc.current = src;
      setState(src ? 'loading' : 'empty');
    }
  }, [src]);

  // A cached image can finish decoding before React attaches onLoad, so
  // check `complete` as soon as the node exists.
  const checkCached = (node) => {
    if (node?.complete && node.naturalWidth > 0) setState('ready');
  };

  return (
    <span
      className={`img ${className}`.trim()}
      style={ratio ? { aspectRatio: ratio } : undefined}
      data-state={state}
    >
      {src && state !== 'error' && (
        <img
          ref={checkCached}
          src={src}
          srcSet={srcSet}
          sizes={srcSet ? sizes : undefined}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={eager ? 'high' : undefined}
          onLoad={() => setState('ready')}
          onError={() => setState('error')}
          style={{ objectFit: fit, objectPosition: position }}
          {...rest}
        />
      )}

      {(state === 'loading' || state === 'empty') && (
        <span className="img__shim" aria-hidden="true" />
      )}

      {state === 'error' && (
        <span className="img__fallback" aria-hidden="true">
          <Icon.image />
        </span>
      )}
    </span>
  );
}
