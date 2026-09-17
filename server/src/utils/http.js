import slugify from 'slugify';

/** Error with an HTTP status attached. */
export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
  static badRequest(msg = 'Bad request', details) { return new ApiError(400, msg, details); }
  static unauthorized(msg = 'Not authenticated') { return new ApiError(401, msg); }
  static forbidden(msg = 'Not allowed') { return new ApiError(403, msg); }
  static notFound(msg = 'Not found') { return new ApiError(404, msg); }
  static conflict(msg = 'Already exists') { return new ApiError(409, msg); }
}

/** Wrap an async route so rejections reach the error middleware. */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/** Build a URL-safe slug, guaranteed unique against a table. */
export const makeSlug = async (db, table, value, excludeId = null) => {
  const base = slugify(String(value || 'item'), { lower: true, strict: true }) || 'item';
  let slug = base;
  let n = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const params = excludeId ? [slug, excludeId] : [slug];
    const sql = excludeId
      ? `SELECT 1 FROM ${table} WHERE slug = $1 AND id <> $2`
      : `SELECT 1 FROM ${table} WHERE slug = $1`;
    const { rowCount } = await db.query(sql, params);
    if (!rowCount) return slug;
    slug = `${base}-${++n}`;
  }
};

/** Validate a body with a zod schema, throwing a 400 with field details. */
export const parseBody = (schema, body) => {
  const result = schema.safeParse(body);
  if (!result.success) {
    const details = result.error.issues.map((i) => ({
      field: i.path.join('.'),
      message: i.message,
    }));
    throw ApiError.badRequest('Please check the highlighted fields', details);
  }
  return result.data;
};

/** Coerce "true"/"1"/true into a boolean. */
export const toBool = (v, fallback = false) => {
  if (v === undefined || v === null || v === '') return fallback;
  if (typeof v === 'boolean') return v;
  return ['true', '1', 'yes', 'on'].includes(String(v).toLowerCase());
};

/** Coerce a value into an integer or null. */
export const toInt = (v, fallback = null) => {
  if (v === undefined || v === null || v === '') return fallback;
  const n = Number.parseInt(v, 10);
  return Number.isNaN(n) ? fallback : n;
};

/** Always store JSONB columns as real JSON. */
export const toJson = (v, fallback) => {
  if (v === undefined || v === null || v === '') return JSON.stringify(fallback);
  if (typeof v === 'string') {
    try { return JSON.stringify(JSON.parse(v)); } catch { return JSON.stringify(fallback); }
  }
  return JSON.stringify(v);
};
