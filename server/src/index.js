import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';

import { pool } from './db/pool.js';
import { ApiError } from './utils/http.js';
import { cached, invalidateOnWrite } from './utils/cache.js';
import { UPLOAD_DIR } from './middleware/upload.js';

import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import enquiryRoutes from './routes/enquiries.js';
import settingsRoutes from './routes/settings.js';
import mediaRoutes from './routes/media.js';
import pageRoutes from './routes/pages.js';
import dashboardRoutes from './routes/dashboard.js';
import bootstrapRoutes from './routes/bootstrap.js';
import { crudRouter } from './routes/crud.js';
import { migrate } from './db/migrate.js';
import { isEmptyDatabase, seed } from './db/seed.js';

dotenv.config();

// Resolve against this file rather than process.cwd(): on a host like Render
// the process is started from the repository root, not from server/.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVER_ROOT = path.resolve(__dirname, '..');
const CLIENT_DIST = path.resolve(SERVER_ROOT, '../client/dist');

const app = express();
const PORT = Number(process.env.PORT || 5000);

app.set('trust proxy', 1);

/**
 * Helmet's default CSP is `img-src 'self' data:`, which blocks every image
 * that is not served from this origin — including the Unsplash photography,
 * anything the admin pastes from a CDN, the Google Fonts stylesheet and the
 * Maps embed. Widen it to exactly what the site uses.
 */
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        // Content images are editable in the admin and may live on any HTTPS host.
        imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'data:', 'https://fonts.gstatic.com'],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'", 'https:'],
        frameSrc: ["'self'", 'https://www.google.com', 'https://maps.google.com'],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
      },
    },
  })
);
app.use(compression());
app.use(
  cors({
    origin: (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',').map((s) => s.trim()),
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

// Uploaded images are served straight from disk.
app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '30d' }));

// ------------------------------------------------------------- health
app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, db: 'connected', time: new Date().toISOString() });
  } catch (err) {
    res.status(503).json({ ok: false, db: 'unreachable', error: err.message });
  }
});

// ------------------------------------------------------------- routes
// Any successful write drops the public read cache.
app.use('/api', invalidateOnWrite);

app.use('/api/bootstrap', bootstrapRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/settings', cached('settings'), settingsRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/pages', pageRoutes);

app.use(
  '/api/categories',
  crudRouter({
    table: 'categories',
    fields: ['name', 'description', 'sort_order', 'is_active'],
    slugFrom: 'name',
    required: ['name'],
    intFields: ['sort_order'],
    boolFields: ['is_active'],
  })
);

app.use(
  '/api/services',
  crudRouter({
    table: 'services',
    fields: ['title', 'short_desc', 'description', 'icon', 'image_url', 'highlights', 'sort_order', 'is_active'],
    slugFrom: 'title',
    required: ['title'],
    jsonFields: ['highlights'],
    intFields: ['sort_order'],
    boolFields: ['is_active'],
    touch: true,
  })
);

app.use(
  '/api/kitchen-layouts',
  crudRouter({
    table: 'kitchen_layouts',
    fields: ['title', 'description', 'image_url', 'best_for', 'features', 'sort_order', 'is_active'],
    slugFrom: 'title',
    required: ['title'],
    jsonFields: ['features'],
    intFields: ['sort_order'],
    boolFields: ['is_active'],
  })
);

app.use(
  '/api/materials',
  crudRouter({
    table: 'materials',
    fields: ['name', 'category', 'description', 'image_url', 'swatch_hex', 'sort_order', 'is_active'],
    required: ['name'],
    intFields: ['sort_order'],
    boolFields: ['is_active'],
  })
);

app.use(
  '/api/testimonials',
  crudRouter({
    table: 'testimonials',
    fields: ['name', 'location', 'role', 'rating', 'message', 'avatar_url', 'project_id', 'sort_order', 'is_active'],
    required: ['name', 'message'],
    intFields: ['rating', 'sort_order'],
    nullableIntFields: ['project_id'],
    boolFields: ['is_active'],
  })
);

app.use(
  '/api/team',
  crudRouter({
    table: 'team_members',
    fields: ['name', 'role', 'bio', 'photo_url', 'socials', 'sort_order', 'is_active'],
    required: ['name'],
    jsonFields: ['socials'],
    intFields: ['sort_order'],
    boolFields: ['is_active'],
  })
);

app.use(
  '/api/process',
  crudRouter({
    table: 'process_steps',
    fields: ['step_no', 'title', 'description', 'icon', 'is_active'],
    required: ['title'],
    order: 'step_no ASC, id ASC',
    intFields: ['step_no'],
    boolFields: ['is_active'],
  })
);

app.use(
  '/api/stats',
  crudRouter({
    table: 'stats',
    fields: ['label', 'value', 'suffix', 'sort_order', 'is_active'],
    required: ['label'],
    intFields: ['value', 'sort_order'],
    boolFields: ['is_active'],
  })
);

app.use(
  '/api/faqs',
  crudRouter({
    table: 'faqs',
    fields: ['question', 'answer', 'category', 'sort_order', 'is_active'],
    required: ['question', 'answer'],
    intFields: ['sort_order'],
    boolFields: ['is_active'],
  })
);

// -------------------------------------------------- production client
if (process.env.NODE_ENV === 'production') {
  const clientDist = CLIENT_DIST;

  // Vite fingerprints everything under /assets, so those files can be cached
  // forever — a new build produces new filenames.
  app.use(
    '/assets',
    express.static(path.join(clientDist, 'assets'), {
      immutable: true,
      maxAge: '1y',
    })
  );

  // Everything else (favicon, robots…) gets a modest cache.
  app.use(express.static(clientDist, { maxAge: '1d', index: false }));

  // The HTML shell must never be cached, or visitors keep the old asset hashes.
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.set('Cache-Control', 'no-cache');
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// ----------------------------------------------------------- errors
app.use((req, _res, next) => next(ApiError.notFound(`No route for ${req.method} ${req.originalUrl}`)));

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  const status = err.status || (err.code === 'LIMIT_FILE_SIZE' ? 413 : 500);
  if (status >= 500) console.error('[error]', err);

  res.status(status).json({
    error: status >= 500 ? 'Something went wrong on our side' : err.message,
    ...(err.details ? { details: err.details } : {}),
  });
});

/**
 * On a managed host the database starts empty and there is no shell step
 * before the first boot, so apply the schema here when RUN_MIGRATIONS is set.
 * schema.sql is written to be idempotent, so this is safe on every restart.
 */
async function start() {
  if (process.env.RUN_MIGRATIONS === 'true') {
    try {
      await migrate();

      // A managed host has no shell before the first boot, so a brand new
      // database would come up empty with no way in. Seed it once, guarded
      // on there being no admin user, so existing content is never lost.
      if (await isEmptyDatabase()) {
        console.log('[startup] empty database detected, seeding initial content');
        await seed();
      }
    } catch (err) {
      console.error('[startup] database setup failed:', err.message);
      // Keep serving anyway: /api/health reports the database as unreachable.
    }
  }

  return app.listen(PORT, () => {
    console.log(`\n  Tanushree Designs API  ->  port ${PORT}`);
    console.log(`  Health check           ->  /api/health\n`);
  });
}

const server = await start();

/**
 * Close database connections before exiting. Beyond being good practice,
 * the PGlite dev server needs a clean disconnect — an abrupt kill leaves
 * its single socket wedged until it is restarted.
 */
const shutdown = async (signal) => {
  console.log(`\n[server] ${signal} received, shutting down`);
  server.close();
  try {
    await pool.end();
  } catch {
    /* already closed */
  }
  process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

export default app;
