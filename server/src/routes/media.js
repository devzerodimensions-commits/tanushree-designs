import fs from 'node:fs';
import path from 'node:path';
import { Router } from 'express';
import { pool } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';
import { upload, UPLOAD_DIR } from '../middleware/upload.js';
import { ApiError, asyncHandler, toInt } from '../utils/http.js';

const router = Router();

const publicUrl = (req, filename) => {
  const base = process.env.PUBLIC_URL || `${req.protocol}://${req.get('host')}`;
  return `${base}/uploads/${filename}`;
};

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { folder } = req.query;
    const params = [];
    let where = '';
    if (folder && folder !== 'all') {
      params.push(folder);
      where = 'WHERE folder = $1';
    }
    const { rows } = await pool.query(
      `SELECT * FROM media ${where} ORDER BY created_at DESC LIMIT ${toInt(req.query.limit, 300)}`,
      params
    );
    res.json({ data: rows });
  })
);

router.post(
  '/upload',
  requireAuth,
  upload.array('files', 20),
  asyncHandler(async (req, res) => {
    const files = req.files || [];
    if (!files.length) throw ApiError.badRequest('Please choose at least one image');

    const folder = req.body.folder || 'general';
    const saved = [];
    for (const file of files) {
      const { rows } = await pool.query(
        `INSERT INTO media (filename, url, mime_type, size_bytes, alt_text, folder)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
        [
          file.filename,
          publicUrl(req, file.filename),
          file.mimetype,
          file.size,
          req.body.alt_text || path.basename(file.originalname, path.extname(file.originalname)),
          folder,
        ]
      );
      saved.push(rows[0]);
    }
    res.status(201).json({ data: saved });
  })
);

/** Register an external image (e.g. a CDN URL) in the library. */
router.post(
  '/link',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { url, alt_text, folder } = req.body;
    if (!url) throw ApiError.badRequest('Image URL is required');
    const { rows } = await pool.query(
      `INSERT INTO media (filename, url, mime_type, size_bytes, alt_text, folder)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [url.split('/').pop()?.slice(0, 200) || 'linked-image', url, 'image/external', 0, alt_text || null, folder || 'general']
    );
    res.status(201).json({ data: rows[0] });
  })
);

router.patch(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query(
      `UPDATE media SET alt_text = COALESCE($2, alt_text), folder = COALESCE($3, folder)
       WHERE id = $1 RETURNING *`,
      [Number(req.params.id), req.body.alt_text ?? null, req.body.folder ?? null]
    );
    if (!rows[0]) throw ApiError.notFound();
    res.json({ data: rows[0] });
  })
);

router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query('SELECT * FROM media WHERE id = $1', [Number(req.params.id)]);
    const item = rows[0];
    if (!item) throw ApiError.notFound();

    // Only remove files we actually store on disk.
    if (item.mime_type !== 'image/external') {
      const filePath = path.join(UPLOAD_DIR, item.filename);
      if (filePath.startsWith(UPLOAD_DIR) && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    await pool.query('DELETE FROM media WHERE id = $1', [item.id]);
    res.json({ ok: true });
  })
);

export default router;
