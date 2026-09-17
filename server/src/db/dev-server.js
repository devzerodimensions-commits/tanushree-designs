/**
 * Zero-install development database.
 *
 * Runs PGlite (a real PostgreSQL compiled to WASM) and exposes it on the
 * normal Postgres wire protocol, so `pg`, psql and every script in this
 * project talk to it exactly as they would to a installed server.
 *
 *   npm run db:dev        -> starts it on 127.0.0.1:5432
 *
 * Data is persisted in server/.pgdata. This is for local development and
 * demos only — use a real PostgreSQL server in production.
 */
import path from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { PGLiteSocketServer } from '@electric-sql/pglite-socket';
import dotenv from 'dotenv';

dotenv.config();

const DATA_DIR = path.resolve(process.cwd(), '.pgdata');
const PORT = Number(process.env.DEV_DB_PORT || 5432);

const db = await PGlite.create({ dataDir: DATA_DIR });

const server = new PGLiteSocketServer({ db, port: PORT, host: '127.0.0.1' });
await server.start();

console.log(`\n  Dev PostgreSQL (PGlite)  ->  127.0.0.1:${PORT}`);
console.log(`  Data directory           ->  ${DATA_DIR}`);
console.log('  Leave this running, then use npm run db:reset and npm run dev.\n');

const shutdown = async () => {
  await server.stop();
  await db.close();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
