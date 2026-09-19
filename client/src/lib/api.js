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
const READ_RETRIES = 4;
const RETRY_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);

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
    try {
      res = await fetch(`${BASE}${path}`, {
        method,
        headers,
        body: isForm ? body : body !== undefined ? JSON.stringify(body) : undefined,
      });
    } catch {
      if (attempt < retries) {
        await sleep(600 * 2 ** attempt);
        attempt += 1;
        continue;
      }
      throw new ApiError('Cannot reach the server. Please check your connection.', 0);
    }

    if (RETRY_STATUS.has(res.status) && attempt < retries) {
      await sleep(600 * 2 ** attempt);
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
export const publicApi = {
  /** Everything a page renders, in one request. */
  bootstrap: (page) => api.get(`/bootstrap/${page}`),
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
