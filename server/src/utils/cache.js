/**
 * Tiny in-process cache for public read endpoints.
 *
 * The public site is read-heavy and its content changes only when someone
 * saves in the admin panel, so every read can be served from memory and the
 * whole cache dropped on any write.
 */
const store = new Map();

const DEFAULT_TTL = Number(process.env.CACHE_TTL_MS || 60_000);

export function cacheGet(key) {
  const hit = store.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expires) {
    store.delete(key);
    return null;
  }
  return hit.value;
}

export function cacheSet(key, value, ttl = DEFAULT_TTL) {
  store.set(key, { value, expires: Date.now() + ttl });
  return value;
}

/** Drop everything. Called after any admin write. */
export function cacheClear() {
  store.clear();
}

/**
 * While this is false nothing is stored and nothing is served from store.
 *
 * The port is opened before migrations and back-filling run, so the server
 * can answer — and cache — a request describing a database that is still
 * half-populated. That half-a-page then stood for the whole TTL, which from
 * the outside looked like "a section is missing until I refresh". Suspending
 * the cache until setup finishes closes the window, including for a request
 * that was already in flight when setup completed.
 */
let enabled = true;

export function cacheSuspend() {
  enabled = false;
  store.clear();
}

export function cacheResume() {
  store.clear();
  enabled = true;
}

export function cacheStats() {
  return { entries: store.size, keys: [...store.keys()] };
}

/**
 * Express middleware: serve a cached JSON body for GETs, and set browser
 * cache headers so repeat visits skip the network entirely.
 */
export function cached(key, ttl = DEFAULT_TTL) {
  return (req, res, next) => {
    // Only public GETs are cacheable; admin reads must always be fresh.
    if (!enabled || req.method !== 'GET' || req.headers.authorization) return next();

    const full = typeof key === 'function' ? key(req) : key;
    const hit = cacheGet(full);

    res.set('Cache-Control', `public, max-age=0, s-maxage=${Math.floor(ttl / 1000)}, stale-while-revalidate=300`);

    if (hit) {
      res.set('X-Cache', 'HIT');
      return res.json(hit);
    }

    res.set('X-Cache', 'MISS');
    // Capture the payload on the way out.
    const json = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode === 200) cacheSet(full, body, ttl);
      return json(body);
    };
    next();
  };
}

/** Middleware that clears the cache after a successful write. */
export function invalidateOnWrite(req, res, next) {
  if (req.method === 'GET' || req.method === 'HEAD') return next();
  res.on('finish', () => {
    if (res.statusCode >= 200 && res.statusCode < 400) cacheClear();
  });
  next();
}
