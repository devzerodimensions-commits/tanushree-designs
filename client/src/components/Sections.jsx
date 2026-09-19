import { Link } from 'react-router-dom';
import { useSite } from '../context/SiteContext.jsx';
import { useCountUp } from '../hooks/useApi.js';
import Reveal, { RevealGroup, RevealItem } from './Reveal.jsx';
import Icon from '../lib/icons.jsx';
import Img from './Img.jsx';

/* ---------------------------------------------------------- headings */
export function SectionHead({ eyebrow, title, text, center = false, light = false, children }) {
  return (
    <Reveal className={`section-head${center ? ' section-head--center' : ''}`}>
      {eyebrow && (
        <span
          className={`eyebrow${light ? ' eyebrow--light' : ''}${center ? ' eyebrow--center' : ''}`}
        >
          {eyebrow}
        </span>
      )}
      {title && <h2>{title}</h2>}
      {text && <p className="section-lead">{text}</p>}
      {children}
    </Reveal>
  );
}

/* --------------------------------------------------------- page banner */
export function Banner({ title, text, image, crumbs = [] }) {
  return (
    <section className="banner">
      <div className="banner__media">
        <Img src={image} alt="" eager />
      </div>
      <div className="shell banner__inner">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          {crumbs.map((c) => (
            <span key={c}>
              {' / '}
              {c}
            </span>
          ))}
        </nav>
        <Reveal>
          <h1>{title}</h1>
          {text && <p className="banner__text">{text}</p>}
        </Reveal>
      </div>
    </section>
  );
}

/* --------------------------------------------------------- trust strip */
export function TrustStrip({ items = [] }) {
  if (!items.length) return null;
  return (
    <Reveal className="trust" from="scale">
      {items.map((u) => {
        const Glyph = Icon[u.icon] || Icon.shield;
        return (
          <div className="trust__item" key={u.title}>
            <span className="trust__icon">
              <Glyph />
            </span>
            <div>
              <div className="trust__title">{u.title}</div>
              <div className="trust__text">{u.text}</div>
            </div>
          </div>
        );
      })}
    </Reveal>
  );
}

/* ---------------------------------------------------------------- stat */
function Stat({ label, value, suffix }) {
  const [count, ref] = useCountUp(value);
  return (
    <div className="stat" ref={ref}>
      <b>
        {count}
        {suffix}
      </b>
      <span>{label}</span>
    </div>
  );
}

export function StatsBand({ stats = [] }) {
  if (!stats.length) return null;
  return (
    <section className="section section--tight section--maroon grain">
      <div className="shell">
        <div className="stats-row">
          {stats.map((s) => (
            <Stat key={s.id ?? s.label} {...s} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- process */
export function ProcessGrid({ steps = [] }) {
  if (!steps.length) return null;

  // The rail only makes sense while the steps sit in one row, so the column
  // count is fixed rather than left to auto-fit — otherwise a wrapped card
  // leaves a rail pointing at nothing. Past four steps the row would be too
  // cramped to line up anyway, so the rail is dropped.
  const columns = Math.min(steps.length, 4);
  const railed = steps.length <= 4;

  return (
    <RevealGroup
      className={`process-grid${railed ? ' process-grid--railed' : ''}`}
      style={{ '--process-cols': columns }}
    >
      {steps.map((s, i) => {
        const Glyph = Icon[s.icon] || Icon.compass;
        return (
          // The card is inside the animated wrapper rather than being it.
          // RevealItem carries an inline transform from the entrance
          // animation, and an inline style beats a stylesheet rule — so a
          // :hover lift written in CSS would simply never apply.
          <RevealItem className="process-cell" key={s.id ?? s.step_no}>
            <article className="process-step">
              {/* The rail joins this marker to the next, so the last step
                  does not trail off into nothing. */}
              {railed && i < steps.length - 1 && (
                <span className="process-step__rail" aria-hidden="true" />
              )}

              <div className="process-step__head">
                <span className="process-step__marker">
                  <Glyph />
                </span>
                <span className="process-step__no" aria-hidden="true">
                  {String(s.step_no).padStart(2, '0')}
                </span>
              </div>

              <h3>{s.title}</h3>
              <p>{s.description}</p>
            </article>
          </RevealItem>
        );
      })}
    </RevealGroup>
  );
}

/* ------------------------------------------------------------ cta band */
export function CtaBand({ title, text, image }) {
  const { contact } = useSite();
  return (
    <section className="section section--tight">
      <div className="shell">
        <Reveal className="cta-band" from="scale">
          <div className="cta-band__media">
            <Img src={image} alt="" />
          </div>
          <div className="cta-band__inner">
            <div>
              <h2>{title}</h2>
              <p>{text}</p>
            </div>
            <div className="stack">
              <Link className="btn btn--light" to="/contact-us">
                Book a Consultation
              </Link>
              <a
                className="btn btn--outline-light"
                href={`tel:${contact.phone_raw || contact.phone}`}
              >
                <Icon.phone />
                {contact.phone}
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
