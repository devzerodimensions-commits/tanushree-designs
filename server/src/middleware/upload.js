import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import multer from 'multer';
import { ApiError } from '../utils/http.js';

// Anchored to server/ so it does not depend on where the process was started.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.isAbsolute(process.env.UPLOAD_DIR || '')
  ? process.env.UPLOAD_DIR
  : path.resolve(__dirname, '../..', process.env.UPLOAD_DIR || 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'image/svg+xml'];

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const base = path
      .basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 50) || 'image';
    cb(null, `${base}-${Date.now()}-${Math.round(Math.random() * 1e5)}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: Number(process.env.MAX_UPLOAD_MB || 8) * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED.includes(file.mimetype)) {
      return cb(ApiError.badRequest('Only JPG, PNG, WEBP, AVIF, GIF or SVG images are allowed'));
    }
    cb(null, true);
  },
});

export { UPLOAD_DIR };
