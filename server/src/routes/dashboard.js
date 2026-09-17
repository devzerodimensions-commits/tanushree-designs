import { Router } from 'express';
import { pool } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/http.js';

const router = Router();

router.get(
  '/',
  requireAuth,
  asyncHandler(async (_req, res) => {
    const [counts, recent, byStatus, trend] = await Promise.all([
      pool.query(`
        SELECT
          (SELECT COUNT(*)::int FROM projects)                       AS projects,
          (SELECT COUNT(*)::int FROM projects WHERE is_active)       AS projects_live,
          (SELECT COUNT(*)::int FROM services WHERE is_active)       AS services,
          (SELECT COUNT(*)::int FROM testimonials WHERE is_active)   AS testimonials,
          (SELECT COUNT(*)::int FROM enquiries)                      AS enquiries,
          (SELECT COUNT(*)::int FROM enquiries WHERE status = 'new') AS enquiries_new,
          (SELECT COUNT(*)::int FROM media)                          AS media,
          (SELECT COUNT(*)::int FROM kitchen_layouts WHERE is_active) AS layouts
      `),
      pool.query('SELECT * FROM enquiries ORDER BY created_at DESC LIMIT 6'),
      pool.query('SELECT status, COUNT(*)::int AS count FROM enquiries GROUP BY status'),
      pool.query(`
        SELECT to_char(d.day, 'Mon DD') AS label,
               COALESCE(e.count, 0)     AS count
        FROM generate_series(CURRENT_DATE - INTERVAL '13 days', CURRENT_DATE, '1 day') AS d(day)
        LEFT JOIN (
          SELECT date_trunc('day', created_at) AS day, COUNT(*)::int AS count
          FROM enquiries
          WHERE created_at >= CURRENT_DATE - INTERVAL '13 days'
          GROUP BY 1
        ) e ON e.day = d.day
        ORDER BY d.day ASC
      `),
    ]);

    res.json({
      counts: counts.rows[0],
      recent_enquiries: recent.rows,
      by_status: byStatus.rows,
      trend: trend.rows,
    });
  })
);

export default router;
