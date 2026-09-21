const BASE = import.meta.env.VITE_API_URL || '/api';
const TOKEN_KEY = 'td_admin_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

/** Thrown for any non-2xx response; carries field-level details when present. */
export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * How many times a read is retried before it is treated as failed.
 *
 * The API sleeps when the free hosting plan has had no traffic, and the first
 * request that wakes it can take the best part of a minute or come back as a
 * 502 from the proxy. Without this the first visitor after a quiet spell got
 * a page with empty sections and no way to recover but a manual reload —
 * which is exactly what it looked like from the outside: "sometimes a section
 * does not show until I refresh".
 *
 * Only reads are retried. Replaying a POST could submit an enquiry twice.
 */
const READ_RETRIES = 6;
const RETRY_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);

/**
 * How long one attempt is given before it is abandoned and tried again.
 *
 * A sleeping instance does not refuse the connection — it accepts it and
 * holds it while it wakes, so `fetch` neither resolves nor rejects. Nothing
 * above could tell that apart from a slow network, so the retries never ran
 * and the browser sat on a request for minutes with the section blank. A
 * deadline turns that silence into a failure the loop can act on.
 */
const ATTEMPT_TIMEOUT_MS = 20_000;

/** Backoff, capped so the later attempts stay close together. */
const backoff = (n) => Math.min(800 * 2 ** n, 5_000);

async function request(path, { method = 'GET', body, auth = false, isForm = false } = {}) {
  const headers = {};
  if (!isForm) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const retries = method === 'GET' ? READ_RETRIES : 0;
  let attempt = 0;
  let res;

  for (;;) {
    // Abandoned rather than awaited forever; see ATTEMPT_TIMEOUT_MS.
    const control = new AbortController();
    const deadline = setTimeout(() => control.abort(), ATTEMPT_TIMEOUT_MS);

    try {
      res = await fetch(`${BASE}${path}`, {
        method,
        headers,
        body: isForm ? body : body !== undefined ? JSON.stringify(body) : undefined,
        signal: control.signal,
      });
    } catch {
      if (attempt < retries) {
        await sleep(backoff(attempt));
        attempt += 1;
        continue;
      }
      throw new ApiError('Cannot reach the server. Please check your connection.', 0);
    } finally {
      clearTimeout(deadline);
    }

    if (RETRY_STATUS.has(res.status) && attempt < retries) {
      await sleep(backoff(attempt));
      attempt += 1;
      continue;
    }
    break;
  }

  if (res.status === 204) return null;

  const payload = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 401 && auth) {
      clearToken();
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin/login';
      }
    }
    throw new ApiError(payload.error || `Request failed (${res.status})`, res.status, payload.details);
  }

  return payload;
}

export const api = {
  get: (p, auth = false) => request(p, { auth }),
  post: (p, body, auth = false) => request(p, { method: 'POST', body, auth }),
  put: (p, body, auth = false) => request(p, { method: 'PUT', body, auth }),
  patch: (p, body, auth = false) => request(p, { method: 'PATCH', body, auth }),
  del: (p, auth = true) => request(p, { method: 'DELETE', auth }),
  upload: (p, formData) => request(p, { method: 'POST', body: formData, auth: true, isForm: true }),
};

/* ----------------------------------------------------- public reads */

/**
 * Briefly remembers what a page's content request answered.
 *
 * Two things need it. A prefetch started while the pointer rests on a link
 * is only worth making if the page picks the answer up when it mounts a
 * moment later, rather than asking again. And stepping back to a page just
 * visited should not re-ask for wording that cannot have changed in the
 * meantime.
 *
 * The window is short and the store is per-tab, so a reload always asks
 * again — a studio checking its own edit is never more than a refresh away
 * from seeing it. A failed read is dropped rather than remembered, so the
 * page that asks next gets a real attempt and a real error.
 */
const READ_CACHE_MS = 30_000;
const reads = new Map();

function cachedGet(path) {
  const hit = reads.get(path);
  if (hit && Date.now() - hit.at < READ_CACHE_MS) return hit.promise;

  const promise = request(path).catch((err) => {
    reads.delete(path);
    throw err;
  });
  reads.set(path, { at: Date.now(), promise });
  return promise;
}

export const publicApi = {
  /** Everything a page renders, in one request. */
  bootstrap: (page) => cachedGet(`/bootstrap/${page}`),
  settings: () => api.get('/settings'),
  page: (slug) => api.get(`/pages/${slug}`),
  menuLinks: () => api.get('/pages/menu/links'),
  services: () => api.get('/services'),
  categories: () => api.get('/categories'),
  projects: (qs = '') => api.get(`/projects${qs}`),
  project: (slug) => api.get(`/projects/${slug}`),
  layouts: () => api.get('/kitchen-layouts'),
  materials: () => api.get('/materials'),
  testimonials: () => api.get('/testimonials'),
  team: () => api.get('/team'),
  process: () => api.get('/process'),
  stats: () => api.get('/stats'),
  faqs: () => api.get('/faqs'),
  sendEnquiry: (body) => api.post('/enquiries', body),
};

/* ------------------------------------------------------ admin reads */
export const adminApi = {
  login: (body) => api.post('/auth/login', body),
  me: () => api.get('/auth/me', true),
  dashboard: () => api.get('/dashboard', true),
  list: (resource) => api.get(`/${resource}/admin/all`, true),
  create: (resource, body) => api.post(`/${resource}`, body, true),
  update: (resource, id, body) => api.put(`/${resource}/${id}`, body, true),
  toggle: (resource, id) => api.patch(`/${resource}/${id}/toggle`, {}, true),
  remove: (resource, id) => api.del(`/${resource}/${id}`),
  enquiries: (qs = '') => api.get(`/enquiries${qs}`, true),
  updateEnquiry: (id, body) => api.patch(`/enquiries/${id}`, body, true),
  removeEnquiry: (id) => api.del(`/enquiries/${id}`),
  media: (qs = '') => api.get(`/media${qs}`, true),
  uploadMedia: (formData) => api.upload('/media/upload', formData),
  linkMedia: (body) => api.post('/media/link', body, true),
  removeMedia: (id) => api.del(`/media/${id}`),
  settings: () => api.get('/settings/admin/all', true),
  saveSettings: (settings) => api.put('/settings', { settings }, true),
  pages: () => api.get('/pages'),
  savePage: (slug, body) => api.put(`/pages/${slug}`, body, true),
  createPage: (body) => api.post('/pages', body, true),
  removePage: (slug) => api.del(`/pages/${slug}`),
  calcQuotes: (qs = '') => api.get(`/calculator/quotes${qs}`, true),
  updateCalcQuote: (id, body) => api.patch(`/calculator/quotes/${id}`, body, true),
  removeCalcQuote: (id) => api.del(`/calculator/quotes/${id}`),
  changePassword: (body) => api.post('/auth/change-password', body, true),
  updateProfile: (body) => api.put('/auth/profile', body, true),
};
