import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/http.js';

const secret = () => process.env.JWT_SECRET || 'dev-secret-change-me';

export const signToken = (user) =>
  jwt.sign(
    { sub: user.id, email: user.email, name: user.name, role: user.role },
    secret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

/** Require a valid admin bearer token. */
export const requireAuth = (req, _res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next(ApiError.unauthorized('Please sign in to continue'));
  try {
    req.user = jwt.verify(token, secret());
    next();
  } catch {
    next(ApiError.unauthorized('Your session has expired, please sign in again'));
  }
};

/** Restrict a route to specific roles. */
export const requireRole = (...roles) => (req, _res, next) => {
  if (!req.user) return next(ApiError.unauthorized());
  if (!roles.includes(req.user.role)) return next(ApiError.forbidden());
  next();
};
