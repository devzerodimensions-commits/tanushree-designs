import Icon from '../lib/icons.jsx';

/**
 * What a kitchen of this shape is built from, as a share of the whole.
 *
 * Deliberately not the same as a package's included list, where the share is
 * worked out from the prices. This answers a different question — how much
 * plywood goes into an L-shaped kitchen — and no price can answer it, so the
 * figure is typed.
 *
 * The total is shown rather than enforced. A studio part-way through filling
 * the list would otherwise be blocked by its own unfinished work, and a mix
 * that deliberately covers only the board and the finish is a legitimate
 * thing to publish. It is only flagged when it goes over 100%, which cannot
 * be meant.
 */

const toItem = (m) => ({
  name: typeof m === 'string' ? m : (m?.name ?? ''),
  percent: Number(m?.percent) || 0,
});

export default function MaterialsEditor({ value = [], onChange }) {
  const items = (Array.isArray(value) ? value : []).map(toItem);
  const total = items.reduce((t, m) => t + (Number(m.percent) || 0), 0);

  const setAt = (i, patch) =>
    onChange(items.map((m, n) => (n === i ? { ...m, ...patch } : m)));

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
        <span>Material</span>
        <span>How much is used</span>
        <span>Share</span>
        <span />
      </div>

      {items.length === 0 && (
        <p className="incl__empty">
          Nothing listed yet. Add what this shape of kitchen is built from — plywood, laminate,
          hardware — and the share each one takes.
        </p>
      )}

      {items.map((m, i) => {
        const percent = Number(m.percent) || 0;

        return (
          <div className="incl__row" key={i}>
            <input
              type="text"
              value={m.name}
              placeholder="Plywood (carcass)"
              onChange={(e) => setAt(i, { name: e.target.value })}
            />

            <div className="incl__price">
              <input
                type="number"
                min="0"
                max="100"
                value={percent}
                onChange={(e) =>
                  setAt(i, { percent: Math.min(100, Math.max(0, Number(e.target.value) || 0)) })
                }
              />
              <span>%</span>
            </div>

            <div className="incl__share">
              <div className="incl__bar">
                <i style={{ width: `${Math.min(100, percent)}%` }} />
              </div>
              <b>{percent > 0 ? `${percent}%` : '—'}</b>
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
          onClick={() => onChange([...items, { name: '', percent: 0 }])}
        >
          <Icon.plus /> Add a material
        </button>

        <p className="incl__total">
          {total === 0 ? (
            <>Nothing filled in yet, so the calculator does not show a material breakdown.</>
          ) : total > 100 ? (
            <b style={{ color: 'var(--danger, #b3261e)' }}>
              These add up to {total}%, which is more than the whole kitchen. Lower one of them.
            </b>
          ) : (
            <>
              Adds up to <b>{total}%</b>
              {total < 100 && <> — the remaining {100 - total}% is not accounted for.</>}
            </>
          )}
        </p>
      </div>
    </div>
  );
}
