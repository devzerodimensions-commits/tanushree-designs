/**
 * Page content.
 *
 * Two kinds of page live in this table:
 *
 *  - The built-in pages (home, about, modular-kitchen, …). Their layouts are
 *    hand-built in React; this row only supplies their copy. They cannot be
 *    created or deleted from the admin, because deleting one would leave a
 *    route pointing at nothing.
 *
 *  - Custom pages the studio adds itself. These are rendered entirely from
 *    `blocks`, so someone with no technical background can build a page out
 *    of headings, text, images and cards and publish it at its own address.
 */
import { Router } from 'express';
import { pool } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';
import { ApiError, asyncHandler } from '../utils/http.js';

const router = Router();

/** Addresses the site already uses, so a new page cannot sit on top of one. */
const RESERVED = new Set([
  'admin',
  'api',
  'about-us',
  'modular-kitchen',
  'elica-chimney',
  'our-work',
  'contact-us',
  'kitchen-price-calculator',
  'uploads',
  'images',
  'assets',
]);

/** Lower case, letters, digits and single hyphens. Never empty. */
function toSlug(input) {
  return String(input || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 110);
}

/* ---------------------------------------------------------------- read */

/** Admin list: every page, built-in first. */
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const { rows } = await pool.query(
      'SELECT * FROM pages ORDER BY is_custom ASC, nav_order ASC, id ASC'
    );
    res.json({ data: rows });
  })
);

/** Public: the custom pages that should appear in the menus. */
router.get(
  '/menu/links',
  asyncHandler(async (_req, res) => {
    const { rows } = await pool.query(
      `SELECT slug, title FROM pages
       WHERE is_custom AND is_published AND show_in_nav
       ORDER BY nav_order ASC, title ASC`
    );
    res.json({ data: rows });
  })
);

router.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query('SELECT * FROM pages WHERE slug = $1', [req.params.slug]);
    const page = rows[0];
    if (!page) throw ApiError.notFound('Page content not found');

    // An unpublished custom page is invisible to the public, but the admin
    // still needs to open it to work on it.
    if (page.is_custom && !page.is_published && !req.headers.authorization) {
      throw ApiError.notFound('Page content not found');
    }
    res.json({ data: page });
  })
);

/* --------------------------------------------------------------- write */

/** Create a custom page. */
router.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const title = String(req.body.title || '').trim();
    if (title.length < 2) throw ApiError.badRequest('Give the page a name');

    const slug = toSlug(req.body.slug || title);
    if (!slug) throw ApiError.badRequest('That name cannot be turned into a web address');
    if (RESERVED.has(slug)) {
      throw ApiError.badRequest(`"${slug}" is already used by the site. Try another name.`);
    }

    const { rows: clash } = await pool.query('SELECT 1 FROM pages WHERE slug = $1', [slug]);
    if (clash[0]) throw ApiError.badRequest(`A page at "/${slug}" already exists`);

    const { rows } = await pool.query(
      `INSERT INTO pages (slug, title, hero_title, blocks, is_custom, is_published, show_in_nav, nav_order)
       VALUES ($1,$2,$3,'[]'::jsonb, TRUE, FALSE, FALSE,
               COALESCE((SELECT MAX(nav_order) + 1 FROM pages WHERE is_custom), 0))
       RETURNING *`,
      [slug, title, title]
    );
    res.status(201).json({ data: rows[0] });
  })
);

router.put(
  '/:slug',
  requireAuth,
  asyncHandler(async (req, res) => {
    const {
      title,
      hero_title,
      hero_subtitle,
      hero_image,
      sections,
      blocks,
      seo_title,
      seo_description,
      is_published,
      show_in_nav,
      nav_order,
    } = req.body;

    const { rows: existing } = await pool.query('SELECT * FROM pages WHERE slug = $1', [
      req.params.slug,
    ]);
    const before = existing[0];

    const { rows } = await pool.query(
      `INSERT INTO pages (slug, title, hero_title, hero_subtitle, hero_image, sections, blocks,
                          seo_title, seo_description, is_custom, is_published, show_in_nav, nav_order, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7::jsonb,$8,$9,$10,$11,$12,$13,NOW())
       ON CONFLICT (slug) DO UPDATE SET
         title = EXCLUDED.title,
         hero_title = EXCLUDED.hero_title,
         hero_subtitle = EXCLUDED.hero_subtitle,
         hero_image = EXCLUDED.hero_image,
         sections = EXCLUDED.sections,
         blocks = EXCLUDED.blocks,
         seo_title = EXCLUDED.seo_title,
         seo_description = EXCLUDED.seo_description,
         is_published = EXCLUDED.is_published,
         show_in_nav = EXCLUDED.show_in_nav,
         nav_order = EXCLUDED.nav_order,
         updated_at = NOW()
       RETURNING *`,
      [
        req.params.slug,
        title || req.params.slug,
        hero_title || null,
        hero_subtitle || null,
        hero_image || null,
        JSON.stringify(sections ?? before?.sections ?? {}),
        JSON.stringify(Array.isArray(blocks) ? blocks : (before?.blocks ?? [])),
        seo_title || null,
        seo_description || null,
        // is_custom is never changed by an edit: a built-in page must not be
        // able to turn itself into a deletable one, or the reverse.
        before?.is_custom ?? false,
        is_published ?? before?.is_published ?? true,
        show_in_nav ?? before?.show_in_nav ?? false,
        Number.isFinite(Number(nav_order)) ? Number(nav_order) : (before?.nav_order ?? 0),
      ]
    );
    res.json({ data: rows[0] });
  })
);

/** Delete — custom pages only. */
router.delete(
  '/:slug',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query('SELECT is_custom FROM pages WHERE slug = $1', [
      req.params.slug,
    ]);
    if (!rows[0]) throw ApiError.notFound('Page not found');
    if (!rows[0].is_custom) {
      throw ApiError.badRequest(
        'This is one of the built-in pages. It can be edited but not deleted.'
      );
    }
    await pool.query('DELETE FROM pages WHERE slug = $1', [req.params.slug]);
    res.json({ ok: true });
  })
);

export default router;
