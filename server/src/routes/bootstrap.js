/**
 * One request per page.
 *
 * The public pages each needed six or seven separate API calls, which is slow
 * on a cold connection and much worse behind a small connection pool. This
 * route returns everything a page renders in a single round trip, built from
 * one batched query and served from memory on repeat hits.
 */
import { Router } from 'express';
import { pool } from '../db/pool.js';
import { ApiError, asyncHandler } from '../utils/http.js';
import { cached } from '../utils/cache.js';

const router = Router();

const PROJECT_SELECT = `
  SELECT p.*, c.name AS category_name, c.slug AS category_slug
  FROM projects p
  LEFT JOIN categories c ON c.id = p.category_id
  WHERE p.is_active = TRUE
`;

/** Everything the site needs, fetched as one batch. */
async function loadAll() {
  const { rows } = await pool.query(`
    SELECT
      (SELECT json_agg(x) FROM (
        SELECT * FROM services WHERE is_active ORDER BY sort_order, id) x)        AS services,
      (SELECT json_agg(x) FROM (
        SELECT * FROM kitchen_layouts WHERE is_active ORDER BY sort_order, id) x) AS layouts,
      (SELECT json_agg(x) FROM (
        SELECT * FROM materials WHERE is_active ORDER BY sort_order, id) x)       AS materials,
      (SELECT json_agg(x) FROM (
        SELECT * FROM chimney_types WHERE is_active ORDER BY sort_order, id) x)   AS chimneys,
      (SELECT json_agg(x) FROM (
        SELECT t.*,
               pr.title       AS project_title,
               pr.slug        AS project_slug,
               pr.cover_image AS project_image,
               pr.location    AS project_location
        FROM testimonials t
        LEFT JOIN projects pr ON pr.id = t.project_id AND pr.is_active
        WHERE t.is_active ORDER BY t.sort_order, t.id) x)                         AS testimonials,
      (SELECT json_agg(x) FROM (
        SELECT * FROM team_members WHERE is_active ORDER BY sort_order, id) x)    AS team,
      (SELECT json_agg(x) FROM (
        SELECT * FROM process_steps WHERE is_active ORDER BY step_no, id) x)      AS process,
      (SELECT json_agg(x) FROM (
        SELECT * FROM stats WHERE is_active ORDER BY sort_order, id) x)           AS stats,
      (SELECT json_agg(x) FROM (
        SELECT * FROM faqs WHERE is_active ORDER BY sort_order, id) x)            AS faqs,
      (SELECT json_agg(x) FROM (
        SELECT * FROM categories WHERE is_active ORDER BY sort_order, id) x)      AS categories,
      (SELECT json_agg(x) FROM (${PROJECT_SELECT} ORDER BY p.sort_order, p.created_at DESC) x) AS projects,
      (SELECT json_object_agg(key, value) FROM site_settings)                      AS settings,
      (SELECT json_object_agg(slug, to_jsonb(pg)) FROM pages pg)                   AS pages
  `);

  const r = rows[0] ?? {};
  // json_agg returns NULL for empty sets.
  for (const k of Object.keys(r)) r[k] = r[k] ?? (k === 'settings' || k === 'pages' ? {} : []);
  return r;
}

/** What each page actually renders, so we never ship more than needed. */
const PAGE_SHAPES = {
  home: (d) => ({
    settings: d.settings,
    page: d.pages.home ?? null,
    services: d.services,
    projects: d.projects.filter((p) => p.is_featured).slice(0, 6),
    testimonials: d.testimonials,
    process: d.process,
    stats: d.stats,
  }),
  about: (d) => ({
    settings: d.settings,
    page: d.pages.about ?? null,
    team: d.team,
    stats: d.stats,
    process: d.process,
    testimonials: d.testimonials,
  }),
  'modular-kitchen': (d) => ({
    settings: d.settings,
    page: d.pages['modular-kitchen'] ?? null,
    layouts: d.layouts,
    materials: d.materials,
    services: d.services,
    projects: d.projects.filter((p) => p.category_slug === 'modular-kitchen').slice(0, 3),
    faqs: d.faqs,
  }),
  'our-work': (d) => ({
    settings: d.settings,
    page: d.pages['our-work'] ?? null,
    categories: d.categories,
    projects: d.projects,
  }),
  'elica-chimney': (d) => ({
    settings: d.settings,
    page: d.pages['elica-chimney'] ?? null,
    chimneys: d.chimneys,
    faqs: d.faqs.filter((f) => f.category === 'chimney'),
    projects: d.projects.filter((p) => p.category_slug === 'modular-kitchen').slice(0, 3),
  }),
  contact: (d) => ({
    settings: d.settings,
    page: d.pages.contact ?? null,
    // Chimney specifics belong on the Elica page, not under "what people ask
    // us first" on a contact page.
    faqs: d.faqs.filter((f) => f.category !== 'chimney'),
  }),
};

router.get(
  '/:page',
  cached((req) => `bootstrap:${req.params.page}`),
  asyncHandler(async (req, res) => {
    const shape = PAGE_SHAPES[req.params.page];
    if (!shape) throw ApiError.notFound('Unknown page');

    const data = await loadAll();
    res.json({ data: shape(data) });
  })
);

export default router;
