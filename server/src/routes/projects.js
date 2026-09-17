import { Router } from 'express';
import { pool, transaction } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';
import { ApiError, asyncHandler, makeSlug, toBool, toInt, toJson } from '../utils/http.js';

const router = Router();

const SELECT_LIST = `
  SELECT p.*, c.name AS category_name, c.slug AS category_slug,
         COALESCE(i.image_count, 0) AS image_count
  FROM projects p
  LEFT JOIN categories c ON c.id = p.category_id
  LEFT JOIN (
    SELECT project_id, COUNT(*)::int AS image_count
    FROM project_images GROUP BY project_id
  ) i ON i.project_id = p.id
`;

const withImages = async (project) => {
  if (!project) return null;
  const { rows } = await pool.query(
    'SELECT * FROM project_images WHERE project_id = $1 ORDER BY sort_order ASC, id ASC',
    [project.id]
  );
  return { ...project, images: rows };
};

// -------------------------------------------------------------- public
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { category, featured, limit, search } = req.query;
    const where = ['p.is_active = TRUE'];
    const params = [];

    if (category && category !== 'all') {
      params.push(category);
      where.push(`c.slug = $${params.length}`);
    }
    if (toBool(featured)) where.push('p.is_featured = TRUE');
    if (search) {
      params.push(`%${search}%`);
      where.push(`(p.title ILIKE $${params.length} OR p.location ILIKE $${params.length})`);
    }

    const cap = toInt(limit, null);
    const sql = `${SELECT_LIST} WHERE ${where.join(' AND ')}
                 ORDER BY p.sort_order ASC, p.created_at DESC
                 ${cap ? `LIMIT ${cap}` : ''}`;
    const { rows } = await pool.query(sql, params);
    res.json({ data: rows });
  })
);

// ------------------------------------------------------------- admin
router.get(
  '/admin/all',
  requireAuth,
  asyncHandler(async (_req, res) => {
    const { rows } = await pool.query(`${SELECT_LIST} ORDER BY p.sort_order ASC, p.created_at DESC`);
    res.json({ data: rows });
  })
);

router.get(
  '/:idOrSlug',
  asyncHandler(async (req, res) => {
    const { idOrSlug } = req.params;
    const numeric = /^\d+$/.test(idOrSlug);
    const { rows } = await pool.query(
      `${SELECT_LIST} WHERE ${numeric ? 'p.id = $1' : 'p.slug = $1'}`,
      [numeric ? Number(idOrSlug) : idOrSlug]
    );
    if (!rows[0]) throw ApiError.notFound('Project not found');

    const project = await withImages(rows[0]);
    const { rows: related } = await pool.query(
      `${SELECT_LIST} WHERE p.is_active = TRUE AND p.id <> $1
       AND (p.category_id = $2 OR $2 IS NULL)
       ORDER BY p.sort_order ASC LIMIT 3`,
      [project.id, project.category_id]
    );
    res.json({ data: project, related });
  })
);

const collect = (body) => ({
  title: body.title,
  category_id: toInt(body.category_id, null),
  client_name: body.client_name || null,
  location: body.location || null,
  year: toInt(body.year, null),
  area_sqft: body.area_sqft || null,
  duration: body.duration || null,
  summary: body.summary || null,
  description: body.description || null,
  cover_image: body.cover_image || null,
  tags: toJson(body.tags, []),
  is_featured: toBool(body.is_featured, false),
  is_active: toBool(body.is_active, true),
  sort_order: toInt(body.sort_order, 0),
});

const saveImages = async (client, projectId, images) => {
  await client.query('DELETE FROM project_images WHERE project_id = $1', [projectId]);
  const list = Array.isArray(images) ? images : [];
  for (const [index, img] of list.entries()) {
    const url = typeof img === 'string' ? img : img?.image_url;
    if (!url) continue;
    await client.query(
      'INSERT INTO project_images (project_id, image_url, caption, sort_order) VALUES ($1, $2, $3, $4)',
      [projectId, url, typeof img === 'object' ? img.caption || null : null, index]
    );
  }
};

router.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!req.body.title) throw ApiError.badRequest('Project title is required');
    const data = collect(req.body);
    data.slug = await makeSlug(pool, 'projects', req.body.slug || data.title);

    const project = await transaction(async (client) => {
      const cols = Object.keys(data);
      const { rows } = await client.query(
        `INSERT INTO projects (${cols.join(', ')})
         VALUES (${cols.map((_, i) => `$${i + 1}`).join(', ')}) RETURNING *`,
        Object.values(data)
      );
      await saveImages(client, rows[0].id, req.body.images);
      return rows[0];
    });

    res.status(201).json({ data: await withImages(project) });
  })
);

router.put(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const data = collect(req.body);
    data.slug = await makeSlug(pool, 'projects', req.body.slug || data.title, id);

    const project = await transaction(async (client) => {
      const cols = Object.keys(data);
      const { rows } = await client.query(
        `UPDATE projects SET ${cols.map((c, i) => `${c} = $${i + 2}`).join(', ')}, updated_at = NOW()
         WHERE id = $1 RETURNING *`,
        [id, ...Object.values(data)]
      );
      if (!rows[0]) throw ApiError.notFound('Project not found');
      if (req.body.images !== undefined) await saveImages(client, id, req.body.images);
      return rows[0];
    });

    res.json({ data: await withImages(project) });
  })
);

router.patch(
  '/:id/toggle',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query(
      'UPDATE projects SET is_active = NOT is_active WHERE id = $1 RETURNING *',
      [Number(req.params.id)]
    );
    if (!rows[0]) throw ApiError.notFound();
    res.json({ data: rows[0] });
  })
);

router.patch(
  '/:id/feature',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query(
      'UPDATE projects SET is_featured = NOT is_featured WHERE id = $1 RETURNING *',
      [Number(req.params.id)]
    );
    if (!rows[0]) throw ApiError.notFound();
    res.json({ data: rows[0] });
  })
);

router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { rowCount } = await pool.query('DELETE FROM projects WHERE id = $1', [
      Number(req.params.id),
    ]);
    if (!rowCount) throw ApiError.notFound();
    res.json({ ok: true });
  })
);

export default router;
