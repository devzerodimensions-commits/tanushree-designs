import Icon from '../lib/icons.jsx';
import { Field } from './ui.jsx';

/**
 * Edit one menu: a list of links, each a label and a destination.
 *
 * The destination is a dropdown of the pages that actually exist rather than a
 * box to type a path into, because a typed path is the easiest way to end up
 * with a menu item that goes nowhere. "Somewhere else" is there for an outside
 * address, and only then does a free-text box appear.
 */

/** Built-in destinations. Custom pages are appended by the caller. */
export const SITE_DESTINATIONS = [
  { to: '/', label: 'Home' },
  { to: '/about-us', label: 'About Us' },
  { to: '/modular-kitchen', label: 'Modular Kitchen' },
  { to: '/elica-chimney', label: 'Elica Chimney' },
  { to: '/our-work', label: 'Our Work' },
  { to: '/kitchen-price-calculator', label: 'Kitchen Price Calculator' },
  { to: '/contact-us', label: 'Contact Us' },
];

const isExternal = (to) => Boolean(to) && !to.startsWith('/');

export default function MenuEditor({ value = [], onChange, destinations = [], hint }) {
  const rows = Array.isArray(value) ? value : [];
  const known = [...SITE_DESTINATIONS, ...destinations];

  const setAt = (i, patch) => onChange(rows.map((r, n) => (n === i ? { ...r, ...patch } : r)));

  const move = (i, by) => {
    const j = i + by;
    if (j < 0 || j >= rows.length) return;
    const next = [...rows];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className="menu-editor">
      {rows.length === 0 && (
        <p className="menu-editor__empty">
          This menu is empty. Add a link below, or leave it empty to fall back to the standard set.
        </p>
      )}

      {rows.map((row, i) => {
        const custom = isExternal(row.to) || !known.some((k) => k.to === row.to);

        return (
          <div className="menu-row" key={i}>
            <span className="menu-row__no">{i + 1}</span>

            <div className="menu-row__fields">
              <Field label="What it says">
                <input
                  type="text"
                  value={row.label ?? ''}
                  placeholder="Menu wording"
                  onChange={(e) => setAt(i, { label: e.target.value })}
                />
              </Field>

              <Field label="Where it goes">
                <select
                  value={custom ? '__other' : row.to}
                  onChange={(e) =>
                    setAt(i, { to: e.target.value === '__other' ? '' : e.target.value })
                  }
                >
                  {known.map((k) => (
                    <option key={k.to} value={k.to}>
                      {k.label}
                    </option>
                  ))}
                  <option value="__other">Somewhere else…</option>
                </select>
              </Field>

              {custom && (
                <Field
                  label="Address"
                  hint="A page on this site starts with / — or paste a full https:// address"
                  full
                >
                  <input
                    type="text"
                    value={row.to ?? ''}
                    placeholder="/our-showroom"
                    onChange={(e) => setAt(i, { to: e.target.value })}
                  />
                </Field>
              )}
            </div>

            <div className="row-actions menu-row__actions">
              <button
                className="icon-btn"
                title="Move up"
                disabled={i === 0}
                onClick={() => move(i, -1)}
              >
                <Icon.arrowUp />
              </button>
              <button
                className="icon-btn"
                title="Move down"
                disabled={i === rows.length - 1}
                onClick={() => move(i, 1)}
              >
                <Icon.arrowUp style={{ transform: 'rotate(180deg)' }} />
              </button>
              <button
                className="icon-btn icon-btn--danger"
                title="Remove this link"
                onClick={() => onChange(rows.filter((_, n) => n !== i))}
              >
                <Icon.trash />
              </button>
            </div>
          </div>
        );
      })}

      <button
        className="btn btn--ghost btn--sm"
        onClick={() => onChange([...rows, { label: '', to: '/' }])}
      >
        <Icon.plus /> Add a link
      </button>

      {hint && <p className="menu-editor__hint">{hint}</p>}
    </div>
  );
}
