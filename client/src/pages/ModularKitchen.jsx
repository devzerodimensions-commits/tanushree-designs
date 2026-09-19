import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { publicApi } from '../lib/api.js';
import { useApi } from '../hooks/useApi.js';
import { useSite } from '../context/SiteContext.jsx';
import Icon from '../lib/icons.jsx';
import Img from '../components/Img.jsx';
import Seo from '../components/Seo.jsx';
import Reveal, { RevealGroup, RevealItem } from '../components/Reveal.jsx';
import { Banner, CtaBand, SectionHead } from '../components/Sections.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import Faq from '../components/Faq.jsx';

/**
 * Labels for the material categories we know about. Anything else the studio
 * adds is title-cased from its own value, so a new category still reads
 * properly without a code change.
 */
const CATEGORY_LABELS = {
  finish: 'Shutter Finishes',
  core: 'Core Materials',
  countertop: 'Countertops',
  hardware: 'Hardware',
  promise: 'What You Get',
};

const labelFor = (key) =>
  CATEGORY_LABELS[key] ||
  key.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export default function ModularKitchen() {
  const { contact } = useSite();
  const [tab, setTab] = useState('all');

  const { data: boot } = useApi(() => publicApi.bootstrap('modular-kitchen'), []);
  const d = boot?.data ?? {};

  const p = d.page;
  const s = p?.sections ?? {};

  // Built from the categories that are actually present, so a filter can
  // never offer something with nothing behind it. The tabs were hard-coded to
  // finish/core/countertop while every row in the database was a 'promise',
  // which left three buttons that each emptied the section when clicked.
  const tabs = useMemo(() => {
    const present = [...new Set((d.materials ?? []).map((m) => m.category).filter(Boolean))];
    // One group needs no filter.
    if (present.length < 2) return [];
    return [{ key: 'all', label: 'Everything' }, ...present.map((k) => ({ key: k, label: labelFor(k) }))];
  }, [d.materials]);

  // If the chosen tab stops existing — the studio recategorised its last row —
  // fall back rather than showing an empty grid under a selected filter.
  useEffect(() => {
    if (tab !== 'all' && !tabs.some((t) => t.key === tab)) setTab('all');
  }, [tabs, tab]);

  const shownMaterials = useMemo(() => {
    const list = d.materials ?? [];
    return tab === 'all' ? list : list.filter((m) => m.category === tab);
  }, [d.materials, tab]);

  // The first three services read best as alternating feature rows.
  const featured = (d.services ?? []).slice(0, 3);

  return (
    <>
      <Seo
        title={p?.seo_title || 'Modular Kitchen Designs in Ahmedabad | Tanushree Designs'}
        description={p?.seo_description}
        image={p?.hero_image}
      />

      <Banner
        title={p?.hero_title || 'Modular Kitchen'}
        text={p?.hero_subtitle}
        image={p?.hero_image}
        crumbs={['Modular Kitchen']}
      />

      {/* ---------------------------------------------------- layouts */}
      <section className="section" id="layouts">
        <div className="shell">
          <SectionHead
            center
            eyebrow={s.layouts_eyebrow || 'Kitchen Layouts'}
            title={s.layouts_title || 'Find the plan that fits your room'}
            text={s.layouts_text}
          />

          <RevealGroup className="layout-grid">
            {(d.layouts ?? []).map((l) => (
              <RevealItem className="layout-card" key={l.id}>
                <div className="layout-card__media">
                  <Img src={l.image_url} alt={l.title} />
                </div>
                <div className="layout-card__body">
                  {l.best_for && (
                    <span className="layout-card__best">
                      <Icon.sparkle style={{ width: 14, height: 14 }} />
                      Best for {l.best_for}
                    </span>
                  )}
                  <h3>{l.title}</h3>
                  <p>{l.description}</p>
                  {Array.isArray(l.features) && l.features.length > 0 && (
                    <ul className="layout-card__features">
                      {l.features.map((f) => (
                        <li key={f}>
                          <Icon.check />
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* --------------------------------------------------- services */}
      <section className="section section--sand">
        <div className="shell">
          <SectionHead
            eyebrow="What Goes Into It"
            title="Built properly, from the core outwards"
            text="A kitchen is only as good as the parts you stop seeing after installation."
          />

          <div>
            {featured.map((svc) => (
              <Reveal className="feature-row" key={svc.id}>
                <div className="feature-row__media">
                  <Img src={svc.image_url} alt={svc.title} />
                </div>
                <div>
                  <span className="eyebrow">{svc.title}</span>
                  <h3 style={{ marginBottom: 16 }}>{svc.short_desc}</h3>
                  <p className="text-muted">{svc.description}</p>
                  {Array.isArray(svc.highlights) && (
                    <div className="pill-list">
                      {svc.highlights.map((h) => (
                        <span className="pill" key={h}>
                          {h}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- materials */}
      <section className="section" id="materials">
        <div className="shell">
          <SectionHead
            center
            eyebrow={s.materials_eyebrow || 'Materials & Finishes'}
            title={s.materials_title || 'Choose what your kitchen is made of'}
            text={s.materials_text}
          />

          {tabs.length > 0 && (
            <Reveal className="work-filters" style={{ justifyContent: 'center' }}>
              {tabs.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  className={`filter-chip${tab === t.key ? ' is-active' : ''}`}
                  onClick={() => setTab(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </Reveal>
          )}

          <RevealGroup className="material-grid" key={tab}>
            {shownMaterials.map((m) => (
              <RevealItem className="material-card" key={m.id}>
                <div className="material-card__media">
                  <Img src={m.image_url} alt={m.name} />
                </div>
                <div className="material-card__body">
                  <div className="material-card__top">
                    {m.swatch_hex && (
                      <span
                        className="material-card__swatch"
                        style={{ background: m.swatch_hex }}
                        aria-hidden="true"
                      />
                    )}
                    <h4>{m.name}</h4>
                  </div>
                  <p>{m.description}</p>
                  <span className="material-card__cat">{m.category}</span>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* -------------------------------------------------- appliances */}
      <section className="section section--ink grain" id="appliances">
        <div className="shell intro">
          <div>
            <span className="eyebrow eyebrow--light">{s.appliance_eyebrow || 'Appliances'}</span>
            <Reveal as="h2">{s.appliance_title || 'Chimneys, hobs and built-in appliances'}</Reveal>
            <Reveal delay={0.08}>
              <p className="section-lead" style={{ marginTop: 20 }}>
                {s.appliance_text}
              </p>
              <ul className="checks" style={{ margin: '24px 0 28px' }}>
                <li>
                  <Icon.check /> Auto-clean, filterless chimneys that need no filter changes
                </li>
                <li>
                  <Icon.check /> Duct route planned into the cabinetry, not cut in afterwards
                </li>
                <li>
                  <Icon.check /> Supplied and fitted with the kitchen, by the same team
                </li>
              </ul>

              <div className="pill-list">
                {['Elica chimneys', 'Hobs', 'Built-in ovens', 'Sinks & faucets'].map(
                  (x) => (
                    <span className="pill" key={x} style={{ background: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.85)' }}>
                      {x}
                    </span>
                  )
                )}
              </div>
              <div className="stack" style={{ marginTop: 30 }}>
                <a className="btn btn--gold" href={`tel:${contact.phone_raw || contact.phone}`}>
                  <Icon.phone /> Ask about appliances
                </a>
                <Link className="btn btn--outline-light" to="/elica-chimney">
                  Elica chimneys <Icon.arrowRight />
                </Link>
                <Link className="btn btn--outline-light" to="/kitchen-price-calculator">
                  Price my kitchen <Icon.arrowRight />
                </Link>
              </div>
            </Reveal>
          </div>

          <Reveal className="intro__media" from="left" delay={0.1}>
            <div className="intro__img">
              <Img src={s.appliance_image || p?.hero_image} alt="Elica kitchen chimney installation" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------ recent work */}
      <section className="section">
        <div className="shell">
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: 24,
            }}
          >
            <SectionHead
              eyebrow="Recent Kitchens"
              title="Kitchens we handed over lately"
              text="Real rooms, real constraints, real budgets."
            />
            <Reveal delay={0.1} style={{ marginBottom: 'clamp(38px, 5vw, 64px)' }}>
              <Link className="btn btn--ghost" to="/our-work">
                See all work <Icon.arrowRight />
              </Link>
            </Reveal>
          </div>

          <RevealGroup className="work-grid">
            {(d.projects ?? []).map((proj) => (
              <RevealItem key={proj.id}>
                <ProjectCard project={proj} />
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* -------------------------------------------------------- faq */}
      <section className="section section--cream">
        <div className="shell">
          <SectionHead
            center
            eyebrow={s.faq_eyebrow || 'Questions'}
            title={s.faq_title || 'Before you commit, you probably want to know'}
          />
          <Faq items={d.faqs ?? []} />
        </div>
      </section>

      <CtaBand
        title="Send us your floor plan"
        text="We will come back within one working day with two or three layout options and an indicative cost."
        image={p?.hero_image}
      />
    </>
  );
}
