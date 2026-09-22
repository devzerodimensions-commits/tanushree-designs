import Icon from '../lib/icons.jsx';

/** Product usage is independent of the package price. */

/** What a quantity can be counted in. */
const UNITS = ['nos', 'set', 'pair', 'sq ft', 'running ft', 'metre', 'litre', 'kg'];

const toItem = (f) =>
  typeof f === 'string'
    ? { name: f, qty: 0, unit: 'nos' }
    : {
        name: f?.name ?? '',
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
        <span>How much per running ft</span>
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

            {/* Usage is multiplied by measured furniture length. */}
            <div className="incl__qty">
              <input
                aria-label={`Usage per running foot for ${f.name || `product ${i + 1}`}`}
                type="number"
                min="0"
                step="0.01"
                value={f.qty}
                onChange={(e) => setAt(i, { qty: Math.max(0, Number(e.target.value) || 0) })}
              />
              <select aria-label={`Unit for ${f.name || `product ${i + 1}`}`} value={f.unit} onChange={(e) => setAt(i, { unit: e.target.value })}>
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
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
          onClick={() => onChange([...items, { name: '', qty: 0, unit: 'nos' }])}
        >
          <Icon.plus /> Add a product
        </button>

        <p className="incl__total">Usage does not affect the package rate.</p>
      </div>
    </div>
  );
}
