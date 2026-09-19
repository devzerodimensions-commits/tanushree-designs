/**
 * Kitchen price calculator.
 *
 * The estimate is worked out on the server from rates held in the database,
 * never in the browser: a visitor must not be able to edit the numbers, and
 * the studio must be able to change pricing without a redeploy.
 *
 * Public   GET  /api/calculator            options for the wizard
 *          POST /api/calculator/quote      save the lead, return the estimate
 * Admin    GET  /api/calculator/quotes     the pipeline of submitted estimates
 *          PATCH/DELETE /quotes/:id
 */
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { pool } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';
import { ApiError, asyncHandler, parseBody, toInt } from '../utils/http.js';
import { cached } from '../utils/cache.js';

const router = Router();

const quoteLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: { error: 'Too many estimates requested. Please try again shortly.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/* ------------------------------------------------------------- options */
router.get(
  '/',
  cached('calculator'),
  asyncHandler(async (_req, res) => {
    const { rows } = await pool.query(`
      SELECT
        (SELECT json_agg(x) FROM (
          SELECT id, title, slug, description, image_url, segments
          FROM calc_layouts WHERE is_active ORDER BY sort_order, id) x)   AS layouts,
        (SELECT json_agg(x) FROM (
          SELECT id, title, slug, tier, description, image_url, features, rate_per_ft
          FROM calc_packages WHERE is_active ORDER BY sort_order, id) x)  AS packages,
        (SELECT json_agg(x) FROM (
          SELECT id, title, slug, description, image_url, price, category
          FROM calc_addons WHERE is_active ORDER BY sort_order, id) x)    AS addons,
        (SELECT value FROM site_settings WHERE key = 'calculator')        AS settings
    `);

    const r = rows[0] ?? {};
    res.json({
      data: {
        layouts: r.layouts ?? [],
        packages: r.packages ?? [],
        addons: r.addons ?? [],
        settings: r.settings ?? {},
      },
    });
  })
);

/* -------------------------------------------------------------- quote */
const quoteSchema = z.object({
  name: z.string().min(2, 'Please enter your name'),
  email: z.string().email('Enter a valid email address'),
  phone: z
    .string()
    .optional()
    .nullable()
    .refine((v) => !v || /^[+\d][\d\s\-()]{6,19}$/.test(v), 'Enter a valid phone number'),
  city: z.string().optional().nullable(),
  whatsapp_ok: z.boolean().optional(),
  layout_id: z.number().int().positive('Choose a kitchen layout'),
  package_id: z.number().int().positive('Choose a package'),
  segments: z.record(z.string(), z.number()).optional(),
  addon_ids: z.array(z.number().int().positive()).optional(),
  company_website: z.string().optional().nullable(), // honeypot
});

router.post(
  '/quote',
  quoteLimiter,
  asyncHandler(async (req, res) => {
    const body = parseBody(quoteSchema, req.body);

    // Bots fill the hidden field; accept quietly so they do not retry.
    if (body.company_website) {
      return res.status(201).json({ ok: true, data: null, message: 'Thank you.' });
    }

    const [layout, pkg, settingsRow] = await Promise.all([
      pool.query('SELECT * FROM calc_layouts WHERE id = $1 AND is_active', [body.layout_id]),
      pool.query('SELECT * FROM calc_packages WHERE id = $1 AND is_active', [body.package_id]),
      pool.query("SELECT value FROM site_settings WHERE key = 'calculator'"),
    ]);

    if (!layout.rows[0]) throw ApiError.badRequest('That kitchen layout is no longer available');
    if (!pkg.rows[0]) throw ApiError.badRequest('That package is no longer available');

    const settings = settingsRow.rows[0]?.value ?? {};
    const rangePct = Number(settings.range_percent ?? 12);

    // Running feet: clamp each segment to the range the layout allows so a
    // crafted request cannot produce an absurd figure.
    const segments = layout.rows[0].segments ?? [];
    let runningFeet = 0;
    const measured = {};
    for (const seg of segments) {
      const raw = Number(body.segments?.[seg.label] ?? seg.default ?? 0);
      const feet = Math.min(Number(seg.max ?? 30), Math.max(Number(seg.min ?? 0), raw || 0));
      measured[seg.label] = feet;
      runningFeet += feet;
    }

    // Add-ons are priced from the database, never from the request.
    const addonIds = (body.addon_ids ?? []).slice(0, 20);
    const addons = addonIds.length
      ? (
          await pool.query(
            'SELECT id, title, price FROM calc_addons WHERE id = ANY($1::int[]) AND is_active',
            [addonIds]
          )
        ).rows
      : [];

    const rate = Number(pkg.rows[0].rate_per_ft ?? 0);
    const cabinetry = Math.round(runningFeet * rate);
    const addonTotal = addons.reduce((sum, a) => sum + Number(a.price ?? 0), 0);
    const subtotal = cabinetry + addonTotal;

    // A rate of 0 means the studio has not published a price for that tier.
    // Return the answers without a number rather than showing "₹0".
    const priced = rate > 0;
    const low = priced ? Math.round((subtotal * (100 - rangePct)) / 100) : 0;
    const high = priced ? Math.round((subtotal * (100 + rangePct)) / 100) : 0;

    const breakdown = {
      layout: layout.rows[0].title,
      package: pkg.rows[0].title,
      running_feet: runningFeet,
      rate_per_ft: rate,
      cabinetry,
      addons: addons.map((a) => ({ title: a.title, price: Number(a.price) })),
      addon_total: addonTotal,
      measured,
      priced,
    };

    const { rows } = await pool.query(
      `INSERT INTO calc_quotes
         (name, email, phone, city, whatsapp_ok, layout_id, package_id,
          running_feet, addon_ids, estimate_low, estimate_high, breakdown, ip_address)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10,$11,$12::jsonb,$13)
       RETURNING id, created_at`,
      [
        body.name.trim(),
        body.email.trim().toLowerCase(),
        body.phone?.trim() || null,
        body.city?.trim() || null,
        Boolean(body.whatsapp_ok),
        body.layout_id,
        body.package_id,
        runningFeet,
        JSON.stringify(addons.map((a) => a.id)),
        low,
        high,
        JSON.stringify(breakdown),
        req.ip,
      ]
    );

    res.status(201).json({
      ok: true,
      data: {
        id: rows[0].id,
        priced,
        estimate_low: low,
        estimate_high: high,
        breakdown,
      },
      message:
        settings.success_message ||
        'Thank you. Our design team will call you to talk the estimate through.',
    });
  })
);

/* -------------------------------------------------------- admin inbox */
router.get(
  '/quotes',
  requireAuth,
  asyncHandler(async (req, res) => {
    const where = [];
    const params = [];
    if (req.query.status && req.query.status !== 'all') {
      params.push(req.query.status);
      where.push(`q.status = $${params.length}`);
    }

    const { rows } = await pool.query(
      `SELECT q.*, l.title AS layout_title, p.title AS package_title
       FROM calc_quotes q
       LEFT JOIN calc_layouts l ON l.id = q.layout_id
       LEFT JOIN calc_packages p ON p.id = q.package_id
       ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
       ORDER BY q.created_at DESC LIMIT ${toInt(req.query.limit, 200)}`,
      params
    );

    const { rows: counts } = await pool.query(
      'SELECT status, COUNT(*)::int AS count FROM calc_quotes GROUP BY status'
    );

    res.json({ data: rows, counts });
  })
);

router.patch(
  '/quotes/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const allowed = ['new', 'contacted', 'quoted', 'won', 'closed'];
    const { status, admin_note } = req.body;
    if (status && !allowed.includes(status)) throw ApiError.badRequest('Unknown status');

    const { rows } = await pool.query(
      `UPDATE calc_quotes SET status = COALESCE($2, status), admin_note = COALESCE($3, admin_note)
       WHERE id = $1 RETURNING *`,
      [Number(req.params.id), status || null, admin_note ?? null]
    );
    if (!rows[0]) throw ApiError.notFound();
    res.json({ data: rows[0] });
  })
);

router.delete(
  '/quotes/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { rowCount } = await pool.query('DELETE FROM calc_quotes WHERE id = $1', [
      Number(req.params.id),
    ]);
    if (!rowCount) throw ApiError.notFound();
    res.json({ ok: true });
  })
);

export default router;
