import Icon from '../lib/icons.jsx';

/**
 * What a package includes: the product, its price, and its share of the whole.
 *
 * The share is worked out from the prices rather than typed, so it can never
 * disagree with them and always totals 100%. Change a price and every
 * percentage moves with it — which is the whole point of showing it.
 *
 * Old rows hold plain strings; those are read as an item priced at zero so
 * nothing has to be migrated before this screen is first opened.
 */

/**
 * Whole-number shares that add to exactly 100.
 *
 * The same largest-remainder method the server uses, so the figures here match
 * what a visitor is shown. Rounding each share on its own would let the column
 * total 99% or 101%, which reads as a mistake.
 */
export function shares(items) {
  const total = items.reduce((t, f) => t + (Number(f.rate) || 0), 0);
  if (total <= 0) return items.map(() => 0);

  const exact = items.map((f) => ((Number(f.rate) || 0) / total) * 100);
  const out = exact.map(Math.floor);
  let spare = 100 - out.reduce((t, n) => t + n, 0);

  const order = exact
    .map((v, i) => ({ i, frac: v - Math.floor(v), rate: Number(items[i].rate) || 0 }))
    .sort((a, b) => b.frac - a.frac || b.rate - a.rate);

  for (let n = 0; n < order.length && spare > 0; n += 1, spare -= 1) out[order[n].i] += 1;
  return out;
}

const toItem = (f) =>
  typeof f === 'string'
    ? { name: f, rate: 0 }
    : { name: f?.name ?? '', rate: Number(f?.rate) || 0 };

export default function IncludedEditor({ value = [], onChange }) {
  const items = (Array.isArray(value) ? value : []).map(toItem);
  const total = items.reduce((t, f) => t + (Number(f.rate) || 0), 0);
  const percents = shares(items);

  const setAt = (i, patch) =>
    onChange(items.map((f, n) => (n === i ? { ...f, ...patch } : f)));

  const move = (i, by) => {
    const j = i + by;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className="incl">
      <div className="incl__head">
        <span>Product</span>
        <span>Price per running ft</span>
        <span>Share</span>
        <span />
      </div>

      {items.length === 0 && (
        <p className="incl__empty">
          Nothing listed yet. Add what this package includes — each line shows on the package card.
        </p>
      )}

      {items.map((f, i) => {
        const rate = Number(f.rate) || 0;
        const percent = percents[i];

        return (
          <div className="incl__row" key={i}>
            <input
              type="text"
              value={f.name}
              placeholder="Laminate shutters"
              onChange={(e) => setAt(i, { name: e.target.value })}
            />

            <div className="incl__price">
              <span>₹</span>
              <input
                type="number"
                min="0"
                value={rate}
                onChange={(e) => setAt(i, { rate: Math.max(0, Number(e.target.value) || 0) })}
              />
            </div>

            <div className="incl__share" title="Worked out from the prices">
              <div className="incl__bar">
                <i style={{ width: `${percent}%` }} />
              </div>
              <b>{total > 0 ? `${percent}%` : '—'}</b>
            </div>

            <div className="row-actions">
              <button className="icon-btn" title="Move up" disabled={i === 0} onClick={() => move(i, -1)}>
                <Icon.arrowUp />
              </button>
              <button
                className="icon-btn"
                title="Move down"
                disabled={i === items.length - 1}
                onClick={() => move(i, 1)}
              >
                <Icon.arrowUp style={{ transform: 'rotate(180deg)' }} />
              </button>
              <button
                className="icon-btn icon-btn--danger"
                title="Remove"
                onClick={() => onChange(items.filter((_, n) => n !== i))}
              >
                <Icon.trash />
              </button>
            </div>
          </div>
        );
      })}

      <div className="incl__foot">
        <button
          className="btn btn--ghost btn--sm"
          onClick={() => onChange([...items, { name: '', rate: 0 }])}
        >
          <Icon.plus /> Add a product
        </button>

        <p className="incl__total">
          {total > 0 ? (
            <>
              Package price: <b>₹{total.toLocaleString('en-IN')}</b> per running foot — the sum of
              the lines above.
            </>
          ) : (
            <>
              Nothing priced yet. Leave it that way and the calculator collects the enquiry without
              showing a figure.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
