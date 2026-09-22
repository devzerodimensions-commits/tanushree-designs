import Icon from '../lib/icons.jsx';

/** Product usage is independent of the package price. */

const toItem = (f) =>
  typeof f === 'string'
    ? { name: f, price: 0, usage_percent: 0 }
    : {
        ...f,
        name: f?.name ?? '',
        price: Number(f?.price) || 0,
        usage_percent: Number(f?.usage_percent) || 0,
        qty: Number(f?.qty) || 0,
        unit: f?.unit || 'nos',
      };

export default function IncludedEditor({ value = [], onChange }) {
  const items = (Array.isArray(value) ? value : []).map(toItem);

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
        <span>Price (₹)</span>
        <span>Usage (%)</span>
        <span />
      </div>

      {items.length === 0 && (
        <p className="incl__empty">
          Nothing listed yet. Add what this package includes — each line shows on the package card.
        </p>
      )}

      {items.map((f, i) => {

        return (
          <div className="incl__row" key={i}>
            <input
              aria-label={`Product ${i + 1}`}
              type="text"
              value={f.name}
              placeholder="Laminate shutters"
              onChange={(e) => setAt(i, { name: e.target.value })}
            />

            <div className="incl__price">
              <span aria-hidden="true">₹</span>
              <input aria-label={`Price for ${f.name || 'product'}`} type="number" min="0" step="0.01"
                value={f.price}
                onChange={(e) => setAt(i, { price: Math.max(0, Number(e.target.value) || 0) })} />
            </div>
            <div className="incl__percent">
              <input aria-label={`Usage percentage for ${f.name || 'product'}`} type="number" min="0" max="100" step="0.01"
                value={f.usage_percent}
                onChange={(e) => setAt(i, { usage_percent: Math.min(100, Math.max(0, Number(e.target.value) || 0)) })} />
              <span aria-hidden="true">%</span>
            </div>

            <div className="row-actions">
              <button type="button" className="icon-btn" title="Move up" disabled={i === 0} onClick={() => move(i, -1)}>
                <Icon.arrowUp />
              </button>
              <button
                type="button"
                className="icon-btn"
                title="Move down"
                disabled={i === items.length - 1}
                onClick={() => move(i, 1)}
              >
                <Icon.arrowUp style={{ transform: 'rotate(180deg)' }} />
              </button>
              <button
                type="button"
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
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={() => onChange([...items, { name: '', price: 0, usage_percent: 0 }])}
        >
          <Icon.plus /> Add a product
        </button>

        <p className="incl__total">Enter price and usage percentage separately. Usage is not calculated from price.</p>
      </div>
    </div>
  );
}
