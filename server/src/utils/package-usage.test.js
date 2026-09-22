import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { includedUsage, packageRate } from './package-usage.js';

test('usage scales with furniture length independently of prices', () => {
  const features = [{ name: 'Hinges', qty: 2, unit: 'nos', rate: 500, percent: 100 }];
  assert.deepEqual(includedUsage(features, 15), [{ name: 'Hinges', quantity: 30, unit: 'nos' }]);
  assert.equal(packageRate({ features, rate_per_ft: 2500 }), 2500);
  features[0].qty = 4;
  assert.equal(packageRate({ features, rate_per_ft: 2500 }), 2500);
  assert.equal(includedUsage(features, 15)[0].quantity, 60);
  assert.deepEqual(includedUsage(['Shutters'], 15), [{ name: 'Shutters', quantity: null, unit: 'nos' }]);
  assert.equal(includedUsage([{ name: 'Finish', qty: 1.25, unit: 'litre' }], 3.5)[0].quantity, 4.38);
});

test('migration preserves effective rates and quantities, and is safe to repeat', async () => {
  const db = new PGlite();
  try {
    await db.exec('CREATE TABLE calc_packages (id integer, rate_per_ft numeric, features jsonb)');
    await db.query('INSERT INTO calc_packages VALUES (1, 900, $1), (2, 1200, $2)', [
      JSON.stringify([{ name: 'Hinges', rate: 100, qty: 2, unit: 'nos' }, { name: 'Shutters', rate: 200 }]),
      JSON.stringify(['Legacy item']),
    ]);
    const schema = await readFile(new URL('../db/schema.sql', import.meta.url), 'utf8');
    const migration = schema.slice(schema.indexOf('-- Preserve the previous effective package price once'));
    await db.exec(migration);
    const first = (await db.query('SELECT * FROM calc_packages ORDER BY id')).rows;
    assert.equal(Number(first[0].rate_per_ft), 300);
    assert.deepEqual(first[0].features[0], { name: 'Hinges', qty: 2, unit: 'nos' });
    assert.equal(Number(first[1].rate_per_ft), 1200);
    await db.exec(migration);
    assert.deepEqual((await db.query('SELECT * FROM calc_packages ORDER BY id')).rows, first);
  } finally {
    await db.close();
  }
});
