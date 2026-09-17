import { Router } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { pool } from '../db/pool.js';
import { requireAuth, signToken } from '../middleware/auth.js';
import { ApiError, asyncHandler, parseBody } from '../utils/http.js';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many sign-in attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

router.post(
  '/login',
  loginLimiter,
  asyncHandler(async (req, res) => {
    const { email, password } = parseBody(loginSchema, req.body);

    const { rows } = await pool.query(
      'SELECT * FROM admin_users WHERE lower(email) = lower($1) LIMIT 1',
      [email]
    );
    const user = rows[0];
    if (!user || !user.is_active) throw ApiError.unauthorized('Invalid email or password');

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) throw ApiError.unauthorized('Invalid email or password');

    await pool.query('UPDATE admin_users SET last_login_at = NOW() WHERE id = $1', [user.id]);

    res.json({
      token: signToken(user),
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar_url: user.avatar_url },
    });
  })
);

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query(
      'SELECT id, name, email, role, avatar_url, last_login_at FROM admin_users WHERE id = $1',
      [req.user.sub]
    );
    if (!rows[0]) throw ApiError.unauthorized();
    res.json({ user: rows[0] });
  })
);

const passwordSchema = z.object({
  current_password: z.string().min(1, 'Enter your current password'),
  new_password: z.string().min(8, 'New password must be at least 8 characters'),
});

router.post(
  '/change-password',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { current_password, new_password } = parseBody(passwordSchema, req.body);
    const { rows } = await pool.query('SELECT * FROM admin_users WHERE id = $1', [req.user.sub]);
    const user = rows[0];
    if (!user) throw ApiError.unauthorized();

    const ok = await bcrypt.compare(current_password, user.password_hash);
    if (!ok) throw ApiError.badRequest('Your current password is incorrect');

    const hash = await bcrypt.hash(new_password, 10);
    await pool.query('UPDATE admin_users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [
      hash,
      user.id,
    ]);
    res.json({ ok: true, message: 'Password updated' });
  })
);

const profileSchema = z.object({
  name: z.string().min(2, 'Name is too short'),
  email: z.string().email('Enter a valid email address'),
  avatar_url: z.string().optional().nullable(),
});

router.put(
  '/profile',
  requireAuth,
  asyncHandler(async (req, res) => {
    const data = parseBody(profileSchema, req.body);
    const { rows } = await pool.query(
      `UPDATE admin_users SET name = $1, email = $2, avatar_url = $3, updated_at = NOW()
       WHERE id = $4 RETURNING id, name, email, role, avatar_url`,
      [data.name, data.email, data.avatar_url || null, req.user.sub]
    );
    res.json({ user: rows[0] });
  })
);

export default router;
