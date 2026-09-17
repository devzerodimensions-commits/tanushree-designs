import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { pool } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';
import { ApiError, asyncHandler, parseBody, toInt } from '../utils/http.js';

const router = Router();

const contactLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 8,
  message: { error: 'You have sent several messages already. Please try again shortly.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const enquirySchema = z.object({
  first_name: z.string().min(2, 'Please enter your name'),
  last_name: z.string().optional().nullable(),
  email: z.string().email('Enter a valid email address'),
  phone: z
    .string()
    .optional()
    .nullable()
    .refine((v) => !v || /^[+\d][\d\s\-()]{6,19}$/.test(v), 'Enter a valid phone number'),
  subject: z.string().optional().nullable(),
  message: z.string().min(10, 'Please tell us a little more (at least 10 characters)'),
  source_page: z.string().optional().nullable(),
  // Honeypot: real users never fill this.
  company_website: z.string().optional().nullable(),
});

// -------------------------------------------------- public submission
router.post(
  '/',
  contactLimiter,
  asyncHandler(async (req, res) => {
    const data = parseBody(enquirySchema, req.body);

    if (data.company_website) {
      // Silently accept spam bots so they do not retry.
      return res.status(201).json({ ok: true, message: 'Thank you, we will be in touch soon.' });
    }

    const { rows } = await pool.query(
      `INSERT INTO enquiries (first_name, last_name, email, phone, subject, message, source_page, ip_address)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id, created_at`,
      [
        data.first_name.trim(),
        data.last_name?.trim() || null,
        data.email.trim().toLowerCase(),
        data.phone?.trim() || null,
        data.subject?.trim() || null,
        data.message.trim(),
        data.source_page || 'contact',
        req.ip,
      ]
    );

    res.status(201).json({
      ok: true,
      id: rows[0].id,
      message: 'Thank you for reaching out. Our design team will contact you within 24 hours.',
    });
  })
);

// ------------------------------------------------------------- admin
router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { status, search } = req.query;
    const where = [];
    const params = [];

    if (status && status !== 'all') {
      params.push(status);
      where.push(`status = $${params.length}`);
    }
    if (search) {
      params.push(`%${search}%`);
      where.push(
        `(first_name ILIKE $${params.length} OR email ILIKE $${params.length} OR phone ILIKE $${params.length})`
      );
    }

    const { rows } = await pool.query(
      `SELECT * FROM enquiries ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
       ORDER BY created_at DESC LIMIT ${toInt(req.query.limit, 200)}`,
      params
    );

    const { rows: counts } = await pool.query(
      'SELECT status, COUNT(*)::int AS count FROM enquiries GROUP BY status'
    );

    res.json({ data: rows, counts });
  })
);

router.patch(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const allowed = ['new', 'contacted', 'quoted', 'won', 'closed'];
    const { status, admin_note } = req.body;
    if (status && !allowed.includes(status)) throw ApiError.badRequest('Unknown status');

    const { rows } = await pool.query(
      `UPDATE enquiries SET status = COALESCE($2, status), admin_note = COALESCE($3, admin_note)
       WHERE id = $1 RETURNING *`,
      [Number(req.params.id), status || null, admin_note ?? null]
    );
    if (!rows[0]) throw ApiError.notFound();
    res.json({ data: rows[0] });
  })
);

router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { rowCount } = await pool.query('DELETE FROM enquiries WHERE id = $1', [
      Number(req.params.id),
    ]);
    if (!rowCount) throw ApiError.notFound();
    res.json({ ok: true });
  })
);

export default router;
