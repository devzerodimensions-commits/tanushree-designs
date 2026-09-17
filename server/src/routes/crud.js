/**
 * Generic CRUD router factory.
 *
 * Public  : GET /            -> active rows, ordered
 *           GET /:idOrSlug   -> single active row
 * Admin   : GET /admin/all   -> every row incl. inactive
 *           POST / PUT / DELETE / PATCH :id/toggle / POST reorder
 *
 * Every content table in the admin panel is wired through this so the
 * behaviour (validation, ordering, activation) stays identical everywhere.
 */
import { Router } from 'express';
import { pool } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';
import { ApiError, asyncHandler, makeSlug, toBool, toInt, toJson } from '../utils/http.js';

/**
 * @param {object} cfg
 * @param {string} cfg.table          table name
 * @param {string[]} cfg.fields       writable columns
 * @param {string} [cfg.slugFrom]     column used to generate `slug`
 * @param {string} [cfg.order]        ORDER BY clause
 * @param {string[]} [cfg.jsonFields] columns stored as JSONB
 * @param {string[]} [cfg.boolFields] columns stored as BOOLEAN
 * @param {string[]} [cfg.intFields]  columns stored as INTEGER
 * @param {string[]} [cfg.required]   columns that must be present on create
 */
export function crudRouter(cfg) {
  const {
    table,
    fields,
    slugFrom = null,
    order = 'sort_order ASC, id ASC',
    jsonFields = [],
    boolFields = [],
    intFields = [],
    nullableIntFields = [],
    required = [],
  } = cfg;

  const router = Router();
  const hasActive = fields.includes('is_active') || cfg.hasActive !== false;

  const normalise = (body) => {
    const data = {};
    for (const f of fields) {
      if (!(f in body)) continue;
      let v = body[f];
      if (jsonFields.includes(f)) v = toJson(v, Array.isArray(v) ? [] : []);
      else if (boolFields.includes(f)) v = toBool(v, true);
      else if (nullableIntFields.includes(f)) v = toInt(v, null);
      else if (intFields.includes(f)) v = toInt(v, 0);
      else if (v === '') v = null;
      data[f] = v;
    }
    return data;
  };

  // ------------------------------------------------------------ public
  router.get(
    '/',
    asyncHandler(async (req, res) => {
      const limit = toInt(req.query.limit, null);
      const where = hasActive ? 'WHERE is_active = TRUE' : '';
      const sql = `SELECT * FROM ${table} ${where} ORDER BY ${order}${limit ? ` LIMIT ${limit}` : ''}`;
      const { rows } = await pool.query(sql);
      res.json({ data: rows });
    })
  );

  // ------------------------------------------------------------- admin
  router.get(
    '/admin/all',
    requireAuth,
    asyncHandler(async (_req, res) => {
      const { rows } = await pool.query(`SELECT * FROM ${table} ORDER BY ${order}`);
      res.json({ data: rows });
    })
  );

  router.get(
    '/:idOrSlug',
    asyncHandler(async (req, res) => {
      const { idOrSlug } = req.params;
      const numeric = /^\d+$/.test(idOrSlug);
      const sql = slugFrom && !numeric
        ? `SELECT * FROM ${table} WHERE slug = $1`
        : `SELECT * FROM ${table} WHERE id = $1`;
      const { rows } = await pool.query(sql, [numeric ? Number(idOrSlug) : idOrSlug]);
      if (!rows[0]) throw ApiError.notFound(`No ${table.replace(/_/g, ' ')} found`);
      res.json({ data: rows[0] });
    })
  );

  router.post(
    '/',
    requireAuth,
    asyncHandler(async (req, res) => {
      const data = normalise(req.body);
      for (const f of required) {
        if (!data[f]) throw ApiError.badRequest(`"${f.replace(/_/g, ' ')}" is required`);
      }
      if (slugFrom) data.slug = await makeSlug(pool, table, req.body.slug || data[slugFrom]);

      const cols = Object.keys(data);
      const placeholders = cols.map((_, i) => `$${i + 1}`);
      const { rows } = await pool.query(
        `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`,
        Object.values(data)
      );
      res.status(201).json({ data: rows[0] });
    })
  );

  router.put(
    '/:id',
    requireAuth,
    asyncHandler(async (req, res) => {
      const id = Number(req.params.id);
      const data = normalise(req.body);
      if (slugFrom && (req.body.slug || data[slugFrom])) {
        data.slug = await makeSlug(pool, table, req.body.slug || data[slugFrom], id);
      }
      const cols = Object.keys(data);
      if (!cols.length) throw ApiError.badRequest('Nothing to update');

      const sets = cols.map((c, i) => `${c} = $${i + 2}`);
      if (fields.includes('updated_at') || cfg.touch) sets.push('updated_at = NOW()');

      const { rows } = await pool.query(
        `UPDATE ${table} SET ${sets.join(', ')} WHERE id = $1 RETURNING *`,
        [id, ...Object.values(data)]
      );
      if (!rows[0]) throw ApiError.notFound();
      res.json({ data: rows[0] });
    })
  );

  router.patch(
    '/:id/toggle',
    requireAuth,
    asyncHandler(async (req, res) => {
      const { rows } = await pool.query(
        `UPDATE ${table} SET is_active = NOT is_active WHERE id = $1 RETURNING *`,
        [Number(req.params.id)]
      );
      if (!rows[0]) throw ApiError.notFound();
      res.json({ data: rows[0] });
    })
  );

  router.post(
    '/reorder',
    requireAuth,
    asyncHandler(async (req, res) => {
      const ids = Array.isArray(req.body.ids) ? req.body.ids : [];
      for (const [index, id] of ids.entries()) {
        await pool.query(`UPDATE ${table} SET sort_order = $1 WHERE id = $2`, [index, Number(id)]);
      }
      res.json({ ok: true, count: ids.length });
    })
  );

  router.delete(
    '/:id',
    requireAuth,
    asyncHandler(async (req, res) => {
      const { rowCount } = await pool.query(`DELETE FROM ${table} WHERE id = $1`, [
        Number(req.params.id),
      ]);
      if (!rowCount) throw ApiError.notFound();
      res.json({ ok: true });
    })
  );

  return router;
}
