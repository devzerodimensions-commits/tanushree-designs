import test from 'node:test';
import assert from 'node:assert/strict';
import { usageError, usageTotal } from './usage-percentages.mjs';
const products = (values) => values.map((usage_percent, i) => ({ name: `Product ${i}`, price: i * 300, usage_percent }));
test('six products can share exactly 100% with decimal rounding', () => {
  const rows = products([16.67,16.67,16.67,16.67,16.66,16.66]);
  assert.equal(usageTotal(rows), 10000);
  assert.equal(usageError(rows), null);
  rows[0].price = 9999;
  assert.equal(usageError(rows), null);
});
test('reject totals below or above 100, invalid values, and unnamed rows', () => {
  for (const values of [[40,59.99],[40,60.01],[-10,110],[NaN,100],[33.333,66.667]]) {
    assert.ok(usageError(products(values)));
  }
  assert.ok(usageError([{ name: '', usage_percent: 100 }]));
  assert.ok(usageError(products([60,40]).slice(0,1)));
  assert.equal(usageError(products([100])), null);
  assert.equal(usageError([]), null);
});
