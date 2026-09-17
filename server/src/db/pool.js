import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Postgres returns NUMERIC as string by default; keep ints as JS numbers.
pg.types.setTypeParser(20, (v) => (v === null ? null : Number(v)));

const useUrl = Boolean(process.env.DATABASE_URL);

// The PGlite dev server (npm run db:dev) serves one connection at a time,
// so PG_POOL_MAX=1 keeps that path working. Real PostgreSQL uses the default.
const shared = {
  max: Number(process.env.PG_POOL_MAX || 10),
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
  ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false,
};

export const pool = new Pool(
  useUrl
    ? { ...shared, connectionString: process.env.DATABASE_URL }
    : {
        ...shared,
        host: process.env.PGHOST || 'localhost',
        port: Number(process.env.PGPORT || 5432),
        user: process.env.PGUSER || 'postgres',
        password: process.env.PGPASSWORD || 'postgres',
        database: process.env.PGDATABASE || 'tanushree_designs',
      }
);

pool.on('error', (err) => {
  console.error('[db] unexpected idle client error:', err.message);
});

/** Run a query and return the pg result. */
export const query = (text, params) => pool.query(text, params);

/** Run a query and return the first row (or null). */
export const one = async (text, params) => {
  const { rows } = await pool.query(text, params);
  return rows[0] ?? null;
};

/** Run a query and return all rows. */
export const many = async (text, params) => {
  const { rows } = await pool.query(text, params);
  return rows;
};

/** Run a set of statements inside a transaction. */
export const transaction = async (fn) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export default pool;
