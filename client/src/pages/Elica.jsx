import { Link } from 'react-router-dom';
import { publicApi } from '../lib/api.js';
import { useApi } from '../hooks/useApi.js';
import { useSite } from '../context/SiteContext.jsx';
import Icon from '../lib/icons.jsx';
import Img from '../components/Img.jsx';
import Seo from '../components/Seo.jsx';
import PageBlocks from '../components/PageBlocks.jsx';
import Reveal, { RevealGroup, RevealItem } from '../components/Reveal.jsx';
import { Banner, CtaBand, SectionHead } from '../components/Sections.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import Faq from '../components/Faq.jsx';

/**
 * What actually decides the chimney, in the order we work through it.
 *
 * These are the questions asked at the drawing stage, not product claims —
 * no model, suction figure, warranty or price appears on this page. Those
 * belong in a quote the studio has approved, not in the source.
 */
const DECISIONS = [
  {
    no: 1,
    icon: 'compass',
    title: 'Where the hob sits',
    text: 'Against a wall, on an island, or inside a run of cabinetry. That single decision rules out two of the three chimney types before anything else is discussed.',
  },
  {
    no: 2,
    icon: 'tools',
    title: 'Where the air can go',
    text: 'A ducted chimney pushes smoke and oil out of the building and suits the amount of frying most kitchens here do. Where there is no route to an outside wall, a recirculating unit filters through charcoal and returns the air to the room.',
  },
  {
    no: 3,
    icon: 'shield',
    title: 'How you want to maintain it',
    text: 'Baffle filters are steel plates you take out and wash. A filterless auto-clean unit has nothing in the airflow at all — oil collects in a cup you empty, and a heating cycle loosens the rest.',
  },
  {
    no: 4,
    icon: 'ruler',
    title: 'The size it has to be',
    text: 'The chimney is never narrower than the hob: 60 cm over a two or three burner, 90 cm over a three or four. Suction is then sized against the volume of your room rather than a single number quoted to everyone.',
  },
];

export default function Elica() {
  const { contact } = useSite();

  const { data: boot } = useApi(() => publicApi.bootstrap('elica-chimney'), []);
  const d = boot?.data ?? {};

  const p = d.page;
  const s = p?.sections ?? {};

  return (
    <>
      <Seo
        title={p?.seo_title || 'Elica Kitchen Chimney in Ahmedabad | Tanushree Designs'}
        description={p?.seo_description}
        image={p?.hero_image}
      />

      <Banner
        ready={Boolean(boot)}
        title={p?.hero_title || 'Elica Kitchen Chimneys'}
        text={p?.hero_subtitle}
        image={p?.hero_image}
        crumbs={['Elica Chimney']}
      />

      {/* ------------------------------------------------------ intro */}
      <section className="section">
        <div className="shell">
          <Reveal className="feature-row">
            <div className="feature-row__media">
              <Img src={s.intro_image} alt="" />
            </div>
            <div>
              <span className="eyebrow">{s.intro_eyebrow || 'Elica Chimneys'}</span>
              <h2 style={{ marginBottom: 18 }}>
                {s.intro_title || 'The chimney is drawn with the kitchen, not added to it'}
              </h2>
              <p className="text-muted">{s.intro_text}</p>

              <ul className="checks" style={{ margin: '24px 0 28px' }}>
                <li>
                  <Icon.check /> Duct route and cut-outs drawn before anything is manufactured
                </li>
                <li>
                  <Icon.check /> Auto-clean, filterless options with no filters to buy
                </li>
                <li>
                  <Icon.check /> Fitted by the same team that installs the kitchen
                </li>
              </ul>

              <div className="stack">
                <Link className="btn" to="/kitchen-price-calculator">
                  Price my kitchen <Icon.arrowRight />
                </Link>
                <a className="btn btn--ghost" href={`tel:${contact.phone_raw || contact.phone}`}>
                  <Icon.phone /> Ask about chimneys
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------ types */}
      <section className="section section--sand" id="types">
        <div className="shell">
          <SectionHead
            center
            eyebrow={s.types_eyebrow || 'Types'}
            title={s.types_title || 'Three ways a chimney sits in a kitchen'}
            text={s.types_text}
          />

          <RevealGroup className="layout-grid">
            {(d.chimneys ?? []).map((c) => (
              <RevealItem className="layout-card" key={c.id}>
                <div className="layout-card__media">
                  <Img src={c.image_url} alt={c.title} />
                </div>
                <div className="layout-card__body">
                  {c.best_for && (
                    <span className="layout-card__best">
                      <Icon.sparkle style={{ width: 14, height: 14 }} />
                      Best for {c.best_for}
                    </span>
                  )}
                  <h3>{c.title}</h3>
                  <p>{c.description}</p>
                  {Array.isArray(c.features) && c.features.length > 0 && (
                    <ul className="layout-card__features">
                      {c.features.map((f) => (
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

      {/* --------------------------------------------------- choosing */}
      <section className="section">
        <div className="shell">
          <SectionHead
            center
            eyebrow={s.choose_eyebrow || 'How to choose'}
            title={s.choose_title || 'What actually decides the right chimney'}
            text={s.choose_text}
          />

          <RevealGroup className="process-grid">
            {DECISIONS.map((step) => {
              const Glyph = Icon[step.icon] || Icon.compass;
              return (
                <RevealItem className="process-step" key={step.no}>
                  <div className="process-step__no">{String(step.no).padStart(2, '0')}</div>
                  <div className="process-step__icon">
                    <Glyph />
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </RevealItem>
              );
            })}
          </RevealGroup>
        </div>
      </section>

      {/* ------------------------------------------------- recent work */}
      {(d.projects ?? []).length > 0 && (
        <section className="section section--sand">
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
                eyebrow="Our Work"
                title="Kitchens we have fitted"
                text="Every one of these had its appliances specified alongside the cabinetry."
              />
              <Reveal delay={0.1} style={{ marginBottom: 'clamp(38px, 5vw, 64px)' }}>
                <Link className="btn btn--ghost" to="/our-work">
                  See all work <Icon.arrowRight />
                </Link>
              </Reveal>
            </div>

            <RevealGroup className="work-grid">
              {d.projects.map((proj) => (
                <RevealItem key={proj.id}>
                  <ProjectCard project={proj} />
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      )}

      {/* -------------------------------------------------------- faqs */}
      {(d.faqs ?? []).length > 0 && (
        <section className="section">
          <div className="shell">
            <SectionHead center eyebrow="Questions" title="Chimney questions we are asked most" />
            <Faq items={d.faqs} />
          </div>
        </section>
      )}

      <CtaBand
        title={s.cta_title || 'Bring your floor plan and we will size it with you'}
        text={s.cta_text}
        image={s.cta_image}
      />
      {/* Anything the studio has added to this page in the admin. */}
      <PageBlocks blocks={p?.blocks} />
    </>
  );
}
