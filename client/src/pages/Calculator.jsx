import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { api } from '../lib/api.js';
import { useApi } from '../hooks/useApi.js';
import { useSite } from '../context/SiteContext.jsx';
import Icon from '../lib/icons.jsx';
import Img from '../components/Img.jsx';
import Seo from '../components/Seo.jsx';

const STEPS = ['Kitchen Layout', 'Measurements', 'Package', 'Your Estimate'];
const EASE = [0.22, 1, 0.36, 1];

const rupees = (n, symbol = '₹') =>
  `${symbol}${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

/**
 * Counts a figure up from zero when it first appears.
 *
 * The estimate is what the whole form has been working towards, so it is worth
 * arriving rather than simply being there. Anyone who has asked their system
 * for less movement is given the final number straight away.
 */
function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(target);

  useEffect(() => {
    const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (still || !target) {
      setValue(target);
      return undefined;
    }

    let frame;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      // Eased, so the figure slows as it settles instead of stopping dead.
      setValue(Math.round(target * (1 - (1 - t) ** 3)));
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    setValue(0);
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
}

export default function Calculator() {
  const { contact } = useSite();
  const { data, loading } = useApi(() => api.get('/calculator'), []);

  const d = data?.data ?? {};
  const layouts = d.layouts ?? [];
  const packages = d.packages ?? [];
  const addons = d.addons ?? [];
  const groups = d.groups ?? [];
  const cfg = d.settings ?? {};
  const currency = cfg.currency || '₹';

  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [layoutId, setLayoutId] = useState(null);
  const [segments, setSegments] = useState({});
  const [packageId, setPackageId] = useState(null);
  const [addonIds, setAddonIds] = useState([]);
  /** "Build your own": chosen option ids, and which sub-question we are on. */
  const [buildYourOwn, setBuildYourOwn] = useState(false);
  const [optionIds, setOptionIds] = useState([]);
  const [groupIndex, setGroupIndex] = useState(0);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    whatsapp_ok: true,
    company_website: '',
  });
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [failed, setFailed] = useState(null);

  // Held at the top level because hooks cannot be called from inside the
  // result branch; they sit at zero until there is an estimate to count to.
  const priced = Boolean(result?.data?.priced);
  const low = useCountUp(priced ? Number(result.data.estimate_low) : 0);
  const high = useCountUp(priced ? Number(result.data.estimate_high) : 0);

  const layout = useMemo(() => layouts.find((l) => l.id === layoutId), [layouts, layoutId]);
  const pkg = useMemo(() => packages.find((p) => p.id === packageId), [packages, packageId]);

  const runningFeet = useMemo(
    () => (layout?.segments ?? []).reduce((sum, s) => sum + Number(segments[s.label] ?? s.default ?? 0), 0),
    [layout, segments]
  );

  /** Pick a layout and pre-fill its segments with the standard sizes. */
  const chooseLayout = (l) => {
    setLayoutId(l.id);
    const next = {};
    for (const s of l.segments ?? []) next[s.label] = s.default ?? s.min ?? 0;
    setSegments(next);
  };

  const go = (next) => {
    setDir(next > step ? 1 : -1);
    setStep(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /** Next / Back, aware that step 3 may be a run of questions. */
  const forward = () => {
    if (step === 2 && buildYourOwn && groupIndex < groups.length - 1) {
      setDir(1);
      setGroupIndex((i) => i + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    go(step + 1);
  };

  const back = () => {
    if (step === 2 && buildYourOwn && groupIndex > 0) {
      setDir(-1);
      setGroupIndex((i) => i - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (step === 2 && buildYourOwn) {
      // back out of the questions to the package choice
      setBuildYourOwn(false);
      setOptionIds([]);
      return;
    }
    go(Math.max(0, step - 1));
  };

  const group = buildYourOwn ? groups[groupIndex] : null;

  /** Which option ids belong to a given question. */
  const idsIn = (g) => (g?.options ?? []).map((o) => o.id);

  const chosenIn = (g) => optionIds.filter((id) => idsIn(g).includes(id));

  const toggleOption = (g, id) => {
    setOptionIds((prev) => {
      const mine = idsIn(g);
      if (g.mode === 'multi') {
        return prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      }
      // single and yesno hold at most one answer from their own question
      const others = prev.filter((x) => !mine.includes(x));
      return prev.includes(id) ? others : [...others, id];
    });
  };

  /** Ready to ask for the estimate: a package, or a built specification. */
  const hasSpec = Boolean(packageId) || optionIds.length > 0;

  const canAdvance =
    (step === 0 && Boolean(layoutId)) ||
    (step === 1 && runningFeet > 0) ||
    // A question that must be answered blocks; multi and yes/no may be skipped.
    (step === 2 &&
      (buildYourOwn ? group?.mode !== 'single' || chosenIn(group).length > 0 : Boolean(packageId))) ||
    step === 3;

  const submit = async (e) => {
    e.preventDefault();
    const next = {};
    if (form.name.trim().length < 2) next.name = 'Please enter your name';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(form.email)) next.email = 'Enter a valid email address';
    if (form.phone && !/^[+\d][\d\s\-()]{6,19}$/.test(form.phone)) next.phone = 'Enter a valid phone number';
    setErrors(next);
    if (Object.keys(next).length) return;

    setSending(true);
    setFailed(null);
    try {
      const res = await api.post('/calculator/quote', {
        ...form,
        layout_id: layoutId,
        package_id: packageId,
        option_ids: optionIds,
        segments,
        addon_ids: addonIds,
      });
      setResult(res);
    } catch (err) {
      if (err.details?.length) {
        setErrors(Object.fromEntries(err.details.map((x) => [x.field, x.message])));
      }
      setFailed(err.message || 'We could not work out your estimate. Please call us instead.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="page-loader">
        <span className="spinner spinner--dark" />
      </div>
    );
  }

  if (cfg.enabled === false || !layouts.length || !packages.length) {
    return (
      <div className="shell notfound">
        <div>
          <h2 style={{ marginBottom: 14 }}>The calculator is not available right now</h2>
          <p className="text-muted" style={{ marginBottom: 26 }}>
            Call us on {contact.phone} and we will price your kitchen directly.
          </p>
          <Link className="btn" to="/contact-us">
            Get in touch
          </Link>
        </div>
      </div>
    );
  }

  const slide = {
    enter: (x) => ({ opacity: 0, x: x * 40 }),
    center: { opacity: 1, x: 0 },
    exit: (x) => ({ opacity: 0, x: x * -40 }),
  };

  return (
    <>
      <Seo
        title="Kitchen Price Calculator | Tanushree Designs"
        description="Answer four quick questions and get an indicative estimate for your modular kitchen from Tanushree Designs, Ahmedabad."
      />

      <section className="section section--tight calc">
        <div className="shell">
          {/* ------------------------------------------------ heading */}
          <div className="section-head section-head--center" style={{ marginBottom: 30 }}>
            <span className="eyebrow eyebrow--center">Estimate</span>
            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
              {cfg.headline || 'Kitchen Price Calculator'}
            </h1>
            {cfg.subhead && <p className="section-lead">{cfg.subhead}</p>}
          </div>

          {/* --------------------------------------------- step rail */}
          <ol className="calc-rail" aria-label="Progress">
            {STEPS.map((label, i) => (
              <li
                key={label}
                className={`calc-rail__step${i === step ? ' is-current' : ''}${
                  i < step ? ' is-done' : ''
                }`}
              >
                <button
                  type="button"
                  onClick={() => i < step && go(i)}
                  disabled={i >= step}
                  aria-current={i === step ? 'step' : undefined}
                >
                  <span className="calc-rail__dot">
                    {i < step ? <Icon.check /> : i + 1}
                  </span>
                  <span className="calc-rail__label">{label}</span>
                </button>
              </li>
            ))}
            <li className="calc-rail__count">
              {Math.min(step + 1, STEPS.length)} / {STEPS.length}
            </li>
          </ol>

          {/* ------------------------------------------------- panel */}
          <div className="calc-panel">
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={step}
                custom={dir}
                variants={slide}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: EASE }}
              >
                {/* ---------------------------- 1. layout */}
                {step === 0 && (
                  <>
                    <h2 className="calc-q">Select the layout of your kitchen</h2>
                    <div className="calc-grid">
                      {layouts.map((l) => (
                        <button
                          type="button"
                          key={l.id}
                          className={`calc-card${layoutId === l.id ? ' is-selected' : ''}`}
                          onClick={() => chooseLayout(l)}
                          aria-pressed={layoutId === l.id}
                        >
                          <span className="calc-card__tick" aria-hidden="true">
                            <Icon.check />
                          </span>
                          <span className="calc-card__plan">
                            <img src={l.image_url} alt="" loading="lazy" />
                          </span>
                          <span className="calc-card__body">
                            <b>{l.title}</b>
                            {l.description && <small>{l.description}</small>}
                          </span>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {/* ---------------------- 2. measurements */}
                {step === 1 && layout && (
                  <>
                    <h2 className="calc-q">Now review the measurements for accuracy</h2>

                    <div className="calc-measure">
                      <div className="calc-measure__plan">
                        <img src={layout.image_url} alt={`${layout.title} plan`} />
                      </div>

                      <p className="calc-standard">Standard size has been set for your convenience</p>

                      <div className="calc-measure__fields">
                        {(layout.segments ?? []).map((s) => {
                          // Whole feet between the layout's own limits, so the
                          // list can never offer a size the studio does not build.
                          const min = Math.ceil(Number(s.min ?? 3));
                          const max = Math.floor(Number(s.max ?? 24));
                          const choices = Array.from({ length: max - min + 1 }, (_, i) => min + i);

                          return (
                            <div className="calc-field" key={s.label}>
                              <label className="calc-field__tag" htmlFor={`seg-${s.label}`}>
                                {s.label}
                              </label>
                              <select
                                id={`seg-${s.label}`}
                                value={segments[s.label] ?? s.default ?? min}
                                onChange={(e) =>
                                  setSegments((prev) => ({
                                    ...prev,
                                    [s.label]: Number(e.target.value),
                                  }))
                                }
                              >
                                {choices.map((n) => (
                                  <option key={n} value={n}>
                                    {n}
                                  </option>
                                ))}
                              </select>
                              <span className="calc-field__unit">ft.</span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="calc-total">
                        <span>Total running length</span>
                        <b>{runningFeet} ft</b>
                      </div>
                    </div>
                  </>
                )}

                {/* ------------- 3b. build your own: one question at a time */}
                {step === 2 && buildYourOwn && group && (
                  <>
                    <p className="calc-progress">
                      Question {groupIndex + 1} of {groups.length}
                    </p>
                    <h2 className="calc-q">{group.question}</h2>
                    {group.help_text && <p className="calc-hint">{group.help_text}</p>}

                    <div className={group.mode === 'yesno' ? 'calc-yesno' : 'calc-options'}>
                      {group.mode === 'yesno'
                        ? (group.options ?? []).map((o) => {
                            const on = chosenIn(group).includes(o.id);
                            return (
                              <div className="calc-yesno__row" key={o.id}>
                                <div>
                                  <b>{o.title}</b>
                                  {o.description && <small>{o.description}</small>}
                                  {o.pro_tip && (
                                    <span className="calc-tip">
                                      <Icon.sparkle /> {o.pro_tip}
                                    </span>
                                  )}
                                </div>
                                <div className="calc-yesno__buttons">
                                  <button
                                    type="button"
                                    className={`filter-chip${on ? ' is-active' : ''}`}
                                    onClick={() => !on && toggleOption(group, o.id)}
                                  >
                                    Yes
                                  </button>
                                  <button
                                    type="button"
                                    className={`filter-chip${!on ? ' is-active' : ''}`}
                                    onClick={() => on && toggleOption(group, o.id)}
                                  >
                                    No
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        : (group.options ?? []).map((o) => {
                            const on = chosenIn(group).includes(o.id);
                            return (
                              <button
                                type="button"
                                key={o.id}
                                className={`calc-option${on ? ' is-selected' : ''}`}
                                onClick={() => toggleOption(group, o.id)}
                                aria-pressed={on}
                              >
                                {o.image_url && (
                                  <span className="calc-option__media">
                                    <Img src={o.image_url} alt="" ratio="4 / 3" />
                                  </span>
                                )}
                                <span className="calc-option__body">
                                  <span className="calc-option__head">
                                    <b>{o.title}</b>
                                    <em aria-label={`price level ${o.tier}`}>
                                      {currency.repeat(o.tier || 2)}
                                    </em>
                                  </span>
                                  {o.description && <small>{o.description}</small>}
                                  {o.pro_tip && (
                                    <span className="calc-tip">
                                      <Icon.sparkle /> {o.pro_tip}
                                    </span>
                                  )}
                                </span>
                                <span className="calc-card__tick" aria-hidden="true">
                                  <Icon.check />
                                </span>
                              </button>
                            );
                          })}
                    </div>
                  </>
                )}

                {/* --------------------------- 3. package */}
                {step === 2 && !buildYourOwn && (
                  <>
                    <h2 className="calc-q">Pick your package</h2>
                    <div className="calc-packages">
                      {packages.map((p) => (
                        <button
                          type="button"
                          key={p.id}
                          className={`calc-pkg${packageId === p.id ? ' is-selected' : ''}`}
                          onClick={() => setPackageId(p.id)}
                          aria-pressed={packageId === p.id}
                        >
                          <span className="calc-pkg__media">
                            <Img src={p.image_url} alt={p.title} ratio="16 / 10" />
                          </span>
                          <span className="calc-pkg__body">
                            <span className="calc-pkg__head">
                              <b>{p.title}</b>
                              <em aria-label={`tier ${p.tier}`}>{currency.repeat(p.tier || 2)}</em>
                            </span>
                            {p.description && <small>{p.description}</small>}
                            {Array.isArray(p.features) && (
                              <ul>
                                {p.features.map((f, n) => {
                                  const name = typeof f === 'string' ? f : f?.name;
                                  const usagePercent = typeof f === 'string' ? 0 : Number(f?.usage_percent) || 0;
                                  return (
                                    <li key={`${name}-${n}`}>
                                      <Icon.check />
                                      <span>{name}</span>
                                      {usagePercent > 0 && (
                                        <em className="calc-share">
                                          {usagePercent}%
                                        </em>
                                      )}
                                    </li>
                                  );
                                })}
                              </ul>
                            )}
                          </span>
                          <span className="calc-card__tick" aria-hidden="true">
                            <Icon.check />
                          </span>
                        </button>
                      ))}

                      {/* The fourth card: specify the kitchen yourself. */}
                      {groups.length > 0 && (
                        <button
                          type="button"
                          className="calc-pkg calc-pkg--build"
                          onClick={() => {
                            setBuildYourOwn(true);
                            setGroupIndex(0);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                        >
                          <span className="calc-pkg__body">
                            <span className="calc-pkg__head">
                              <b>Build your own package</b>
                              <em aria-hidden="true">
                                <Icon.tools />
                              </em>
                            </span>
                            <small>
                              Choose the board, the finish, the accessories and the appliances
                              yourself. {groups.length} quick questions.
                            </small>
                            <span className="calc-build-go">
                              Start building <Icon.arrowRight />
                            </span>
                          </span>
                        </button>
                      )}
                    </div>

                    {addons.length > 0 && (
                      <>
                        <h3 className="calc-sub">Add appliances and extras</h3>
                        <div className="calc-addons">
                          {addons.map((a) => {
                            const on = addonIds.includes(a.id);
                            return (
                              <button
                                type="button"
                                key={a.id}
                                className={`calc-addon${on ? ' is-selected' : ''}`}
                                onClick={() =>
                                  setAddonIds((prev) =>
                                    on ? prev.filter((x) => x !== a.id) : [...prev, a.id]
                                  )
                                }
                                aria-pressed={on}
                              >
                                <span className="calc-addon__media">
                                  <Img src={a.image_url} alt="" ratio="4 / 3" />
                                </span>
                                <span className="calc-addon__body">
                                  <b>{a.title}</b>
                                  {a.description && <small>{a.description}</small>}
                                </span>
                                <span className="calc-addon__check" aria-hidden="true">
                                  <Icon.check />
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </>
                )}

                {/* ----------------------------- 4. quote */}
                {step === 3 && !result && (
                  <>
                    <h2 className="calc-q">Your estimate is almost ready</h2>

                    <div className="calc-summary">
                      <div>
                        <span>Layout</span>
                        <b>{layout?.title}</b>
                      </div>
                      <div>
                        <span>Running length</span>
                        <b>{runningFeet} ft</b>
                      </div>
                      <div>
                        <span>Package</span>
                        <b>{pkg?.title ?? (optionIds.length ? 'Built your own' : '—')}</b>
                      </div>
                      <div>
                        <span>Extras</span>
                        <b>{addonIds.length + optionIds.length || 'None'}</b>
                      </div>
                    </div>

                    <form className="calc-form" onSubmit={submit} noValidate>
                      {failed && (
                        <div className="form-alert form-alert--err">
                          <Icon.alert />
                          <span>{failed}</span>
                        </div>
                      )}

                      <div className="field-row">
                        <div className={`field${errors.name ? ' has-error' : ''}`}>
                          <label htmlFor="q-name">
                            Name <span>*</span>
                          </label>
                          <input
                            id="q-name"
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            autoComplete="name"
                          />
                          {errors.name && <span className="field__error">{errors.name}</span>}
                        </div>

                        <div className={`field${errors.email ? ' has-error' : ''}`}>
                          <label htmlFor="q-email">
                            Email <span>*</span>
                          </label>
                          <input
                            id="q-email"
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            autoComplete="email"
                          />
                          {errors.email && <span className="field__error">{errors.email}</span>}
                        </div>
                      </div>

                      <div className="field-row">
                        <div className={`field${errors.phone ? ' has-error' : ''}`}>
                          <label htmlFor="q-phone">Phone</label>
                          <input
                            id="q-phone"
                            type="tel"
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            placeholder="+91 00000 00000"
                            autoComplete="tel"
                          />
                          {errors.phone && <span className="field__error">{errors.phone}</span>}
                        </div>

                        <div className="field">
                          <label htmlFor="q-city">City</label>
                          <input
                            id="q-city"
                            type="text"
                            value={form.city}
                            onChange={(e) => setForm({ ...form, city: e.target.value })}
                            placeholder="Ahmedabad"
                          />
                        </div>
                      </div>

                      <label className="calc-check">
                        <input
                          type="checkbox"
                          checked={form.whatsapp_ok}
                          onChange={(e) => setForm({ ...form, whatsapp_ok: e.target.checked })}
                        />
                        <span>Send me updates on WhatsApp</span>
                      </label>

                      <div className="honeypot" aria-hidden="true">
                        <label htmlFor="q-web">Company website</label>
                        <input
                          id="q-web"
                          type="text"
                          tabIndex={-1}
                          autoComplete="off"
                          value={form.company_website}
                          onChange={(e) => setForm({ ...form, company_website: e.target.value })}
                        />
                      </div>

                      <button className="btn btn--block" type="submit" disabled={sending}>
                        {sending ? <span className="spinner" /> : null}
                        {sending ? 'Working it out…' : 'Show my estimate'}
                      </button>
                    </form>
                  </>
                )}

                {/* ------------------------------ result */}
                {step === 3 && result && (
                  <div className="calc-result">
                    {priced ? (
                      <>
                        <span className="eyebrow eyebrow--center">Indicative estimate</span>
                        <div className="calc-result__figure">
                          {rupees(low, currency)}
                          <i>–</i>
                          {rupees(high, currency)}
                        </div>
                        <p className="calc-result__note">
                          Our design team will connect with you shortly to take it further.
                        </p>
                      </>
                    ) : (
                      <>
                        <span className="eyebrow eyebrow--center">Your enquiry is in</span>
                        <h2 className="calc-result__heading">
                          Our design team will connect with you shortly
                        </h2>
                        <p className="calc-result__note">
                          We price each kitchen from the actual drawings rather than a rate card, so
                          the figure you are given will be for exactly what you have specified.
                        </p>
                      </>
                    )}

                    {result.data?.breakdown && (
                      <dl className="calc-breakdown">
                        <div>
                          <dt>Layout</dt>
                          <dd>{result.data.breakdown.layout}</dd>
                        </div>
                        <div>
                          <dt>Package</dt>
                          <dd>{result.data.breakdown.package}</dd>
                        </div>
                        <div>
                          <dt>Running length</dt>
                          <dd>{result.data.breakdown.running_feet} ft</dd>
                        </div>
                        {result.data.breakdown.addons?.length > 0 && (
                          <div>
                            <dt>Extras</dt>
                            <dd>{result.data.breakdown.addons.map((a) => a.title).join(', ')}</dd>
                          </div>
                        )}
                      </dl>
                    )}

                    {/* Product usage for the measured furniture length. */}
                    {result.data?.breakdown?.included?.length > 0 && (
                      <div className="calc-lines">
                        <h3>What the package includes</h3>
                        <table>
                          <thead>
                            <tr>
                              <th>Product</th>
                              <th>Usage (%)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {result.data.breakdown.included.map((line, n) => (
                              <tr key={`${line.name}-${n}`}>
                                <td>
                                  <b>{line.name}</b>

                                </td>
                                <td>{line.usage_percent != null ? `${line.usage_percent}%` : 'Not specified'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* What was specified, how much of it a kitchen this size
                        needs, and what that comes to. The quantity is shown
                        even where nothing is priced, because "20 running ft of
                        BWP ply" is useful on its own. */}
                    {result.data?.breakdown?.options?.length > 0 && (
                      <div className="calc-lines">
                        <h3>What that is made of</h3>
                        <table>
                          <thead>
                            <tr>
                              <th>Item</th>
                              <th>How much</th>
                              <th>Rate</th>
                              <th>Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {result.data.breakdown.options.map((line) => (
                              <tr key={line.id}>
                                <td>
                                  <b>{line.title}</b>
                                  <small>{line.question}</small>
                                </td>
                                <td>
                                  {line.unit === 'kitchen'
                                    ? '1 kitchen'
                                    : `${line.quantity} ${line.unit}`}
                                </td>
                                <td>
                                  {line.rate > 0
                                    ? `${rupees(line.rate, currency)} / ${
                                        line.unit === 'kitchen' ? 'kitchen' : line.unit
                                      }`
                                    : '—'}
                                </td>
                                <td>{line.amount > 0 ? rupees(line.amount, currency) : '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {result.data.breakdown.shutter_area_sqft > 0 && (
                          <p className="calc-lines__note">
                            Shutter area is worked out as {result.data.breakdown.running_feet} running
                            ft × {result.data.breakdown.cabinet_height_ft} ft of cabinet height ={' '}
                            {result.data.breakdown.shutter_area_sqft} sq ft.
                          </p>
                        )}
                      </div>
                    )}

                    {/* Only meaningful next to a figure — without one it reads
                        as a caveat on an estimate the visitor never saw. */}
                    {priced && <p className="calc-disclaimer">{cfg.disclaimer}</p>}

                    <div className="stack stack--center" style={{ marginTop: 26 }}>
                      <a className="btn" href={`tel:${contact.phone_raw || contact.phone}`}>
                        <Icon.phone /> Call {contact.phone}
                      </a>
                      <a
                        className="btn btn--ghost"
                        href={`https://wa.me/${contact.whatsapp}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Icon.whatsapp /> WhatsApp us
                      </a>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ------------------------------------------------ footer */}
          {!result && (
            <div className="calc-nav">
              <button
                type="button"
                className="btn btn--ghost"
                onClick={back}
                disabled={step === 0}
              >
                <Icon.arrowLeft /> Back
              </button>

              {step < 3 && (
                <button
                  type="button"
                  className="btn"
                  onClick={forward}
                  disabled={!canAdvance}
                >
                  Next <Icon.arrowRight />
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
