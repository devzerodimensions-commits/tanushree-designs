import { Router } from 'express';
import { pool } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/http.js';

const router = Router();

/** Flatten the key/value rows into one object the front end can consume. */
const asObject = (rows) =>
  rows.reduce((acc, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {});

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    // The menu links ride along with the settings the site already fetches on
    // every visit, rather than costing a second request of their own.
    const [settings, menu] = await Promise.all([
      pool.query('SELECT key, value FROM site_settings'),
      pool.query(
        `SELECT slug, title FROM pages
         WHERE is_custom AND is_published AND show_in_nav
         ORDER BY nav_order ASC, title ASC`
      ),
    ]);
    res.json({ data: { ...asObject(settings.rows), custom_pages: menu.rows } });
  })
);

router.get(
  '/admin/all',
  requireAuth,
  asyncHandler(async (_req, res) => {
    const { rows } = await pool.query(
      'SELECT * FROM site_settings ORDER BY group_name ASC, key ASC'
    );
    res.json({ data: rows, values: asObject(rows) });
  })
);

/** Upsert one or many settings: { key: value } or { settings: { key: value } }. */
router.put(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const payload = req.body.settings && typeof req.body.settings === 'object'
      ? req.body.settings
      : req.body;

    const entries = Object.entries(payload);
    for (const [key, value] of entries) {
      await pool.query(
        `INSERT INTO site_settings (key, value, updated_at)
         VALUES ($1, $2::jsonb, NOW())
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
        [key, JSON.stringify(value)]
      );
    }

    const { rows } = await pool.query('SELECT key, value FROM site_settings');
    res.json({ ok: true, updated: entries.length, data: asObject(rows) });
  })
);

export default router;
