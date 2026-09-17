import { Router } from 'express';
import { pool } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';
import { ApiError, asyncHandler } from '../utils/http.js';

const router = Router();

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const { rows } = await pool.query('SELECT * FROM pages ORDER BY id ASC');
    res.json({ data: rows });
  })
);

router.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query('SELECT * FROM pages WHERE slug = $1', [req.params.slug]);
    if (!rows[0]) throw ApiError.notFound('Page content not found');
    res.json({ data: rows[0] });
  })
);

router.put(
  '/:slug',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { title, hero_title, hero_subtitle, hero_image, sections, seo_title, seo_description } =
      req.body;

    const { rows } = await pool.query(
      `INSERT INTO pages (slug, title, hero_title, hero_subtitle, hero_image, sections, seo_title, seo_description, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7,$8,NOW())
       ON CONFLICT (slug) DO UPDATE SET
         title = EXCLUDED.title,
         hero_title = EXCLUDED.hero_title,
         hero_subtitle = EXCLUDED.hero_subtitle,
         hero_image = EXCLUDED.hero_image,
         sections = EXCLUDED.sections,
         seo_title = EXCLUDED.seo_title,
         seo_description = EXCLUDED.seo_description,
         updated_at = NOW()
       RETURNING *`,
      [
        req.params.slug,
        title || req.params.slug,
        hero_title || null,
        hero_subtitle || null,
        hero_image || null,
        JSON.stringify(sections ?? {}),
        seo_title || null,
        seo_description || null,
      ]
    );
    res.json({ data: rows[0] });
  })
);

export default router;
