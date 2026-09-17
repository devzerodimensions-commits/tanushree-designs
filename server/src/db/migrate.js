/**
 * Creates the database (if missing) and applies schema.sql.
 *   npm run db:migrate            -> create/patch tables
 *   npm run db:migrate -- --fresh -> drop all app tables first
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fresh = process.argv.includes('--fresh');

const TABLES = [
  'project_images', 'projects', 'categories', 'services', 'kitchen_layouts',
  'materials', 'testimonials', 'team_members', 'process_steps', 'stats',
  'faqs', 'enquiries', 'pages', 'media', 'site_settings', 'admin_users',
];

function baseConfig(database) {
  if (process.env.DATABASE_URL) {
    const url = new URL(process.env.DATABASE_URL);
    return {
      host: url.hostname,
      port: Number(url.port || 5432),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: database ?? url.pathname.replace(/^\//, ''),
      ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false,
      // Never let a connection attempt hang: the server waits on this.
      connectionTimeoutMillis: 10_000,
      statement_timeout: 60_000,
    };
  }
  return {
    host: process.env.PGHOST || 'localhost',
    port: Number(process.env.PGPORT || 5432),
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
    database: database ?? (process.env.PGDATABASE || 'tanushree_designs'),
    ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 10_000,
    statement_timeout: 60_000,
  };
}

/**
 * Create the target database if we can. Managed providers (and the PGlite
 * dev server) hand you a database you cannot create siblings for, so a
 * failure here is a warning rather than a fatal error.
 */
async function ensureDatabase() {
  // A hosted provider (Neon, Supabase, Render...) gives you the database up
  // front and often denies access to the maintenance database, so trying to
  // CREATE DATABASE there is pointless and can stall.
  if (process.env.DATABASE_URL && !/localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL)) {
    console.log('[migrate] managed database detected, skipping CREATE DATABASE');
    return;
  }

  const target = baseConfig().database;
  let admin;
  try {
    admin = new pg.Client(baseConfig('postgres'));
    await admin.connect();
    const { rowCount } = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [target]);
    if (!rowCount) {
      await admin.query(`CREATE DATABASE "${target}"`);
      console.log(`[migrate] created database "${target}"`);
    } else {
      console.log(`[migrate] database "${target}" already exists`);
    }
  } catch (err) {
    console.log(`[migrate] skipping database creation (${err.message.split('\n')[0]})`);
  } finally {
    await admin?.end().catch(() => {});
  }
}

async function run() {
  await ensureDatabase();

  const client = new pg.Client(baseConfig());
  await client.connect();

  if (fresh) {
    console.log('[migrate] --fresh: dropping existing tables');
    await client.query(`DROP TABLE IF EXISTS ${TABLES.join(', ')} CASCADE`);
  }

  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await client.query(sql);
  console.log('[migrate] schema applied');

  await client.end();
}

export { run as migrate };

// Only self-execute when invoked directly, so the server can import it.
if (process.argv[1] && process.argv[1].endsWith('migrate.js')) {
  run().catch((err) => {
    console.error('[migrate] failed:', err.message);
    console.error('Check that PostgreSQL is running and the credentials are right.');
    process.exit(1);
  });
}
