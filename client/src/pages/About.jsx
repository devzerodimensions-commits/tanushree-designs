import { Link } from 'react-router-dom';
import { publicApi } from '../lib/api.js';
import { useApi } from '../hooks/useApi.js';
import { useSite } from '../context/SiteContext.jsx';
import Icon from '../lib/icons.jsx';
import Img from '../components/Img.jsx';
import Seo from '../components/Seo.jsx';
import Reveal, { RevealGroup, RevealItem } from '../components/Reveal.jsx';
import { Banner, CtaBand, ProcessGrid, SectionHead, StatsBand } from '../components/Sections.jsx';
import Testimonials from '../components/Testimonials.jsx';

export default function About() {
  const { settings } = useSite();
  const { data: boot } = useApi(() => publicApi.bootstrap('about'), []);
  const d = boot?.data ?? {};

  const p = d.page;
  const s = p?.sections ?? {};

  return (
    <>
      <Seo
        title={p?.seo_title || 'About Us | Tanushree Designs'}
        description={p?.seo_description}
        image={p?.hero_image}
      />

      <Banner
        title={p?.hero_title || 'About Us'}
        text={p?.hero_subtitle}
        image={p?.hero_image}
        crumbs={['About Us']}
      />

      {/* ------------------------------------------------------ story */}
      <section className="section">
        <div className="shell intro">
          <div>
            <span className="eyebrow">Our Story</span>
            <Reveal as="h2">{s.story_title || 'How we started'}</Reveal>
            <Reveal delay={0.08}>
              <p className="section-lead" style={{ marginTop: 20 }}>
                {s.story_text}
              </p>
              <ul className="checks">
                <li>
                  <Icon.check /> Every space designed to be both practical and visually refined
                </li>
                <li>
                  <Icon.check /> Layouts optimised around the way you live
                </li>
                <li>
                  <Icon.check /> Materials selected to stand the test of time
                </li>
              </ul>
              <Link className="btn" to="/contact-us">
                Visit the studio <Icon.arrowRight />
              </Link>
            </Reveal>
          </div>

          <Reveal className="intro__media" from="left" delay={0.1}>
            <div className="intro__img">
              <Img src={s.studio_image || p?.hero_image} alt="Tanushree Designs studio" />
            </div>
          </Reveal>
        </div>
      </section>

      <StatsBand stats={d.stats ?? []} />

      {/* ----------------------------------------------------- values */}
      <section className="section section--sand">
        <div className="shell">
          <SectionHead
            center
            eyebrow="Our Principles"
            title={s.values_title || 'What we hold to'}
            text="Four rules that decide every argument on site."
          />

          <RevealGroup className="value-grid">
            {(s.values ?? []).map((v, i) => (
              <RevealItem className="value-card" key={v.title}>
                <i>{String(i + 1).padStart(2, '0')}</i>
                <b>{v.title}</b>
                <p>{v.text}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ---------------------------------------------------- process */}
      <section className="section">
        <div className="shell">
          <SectionHead
            center
            eyebrow="How We Work"
            title="From first sketch to final handle"
            text="The same three stages on every project, whatever its size."
          />
          <ProcessGrid steps={d.process ?? []} />
        </div>
      </section>

      {/* ------------------------------------------------------- team */}
      <section className="section section--cream">
        <div className="shell">
          <SectionHead
            center
            eyebrow="The Team"
            title={s.team_title || 'The people you will work with'}
            text={s.team_text}
          />

          <RevealGroup className="team-grid">
            {(d.team ?? []).map((m) => (
              <RevealItem className="team-card" key={m.id}>
                <div className="team-card__media">
                  {m.photo_url ? (
                    <Img src={m.photo_url} alt={m.name} />
                  ) : (
                    <span className="team-card__initials" aria-hidden="true">
                      {m.name
                        .split(' ')
                        .map((w) => w[0])
                        .slice(0, 2)
                        .join('')}
                    </span>
                  )}
                </div>
                <h4>{m.name}</h4>
                <div className="team-card__role">{m.role}</div>
                <p>{m.bio}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ------------------------------------------------ testimonials */}
      <section className="section section--ink grain">
        <div className="shell">
          <SectionHead
            center
            light
            eyebrow="Testimonials"
            title="What our clients say"
            text="Homeowners across Ahmedabad on what it was like to work with us."
          />
          <Testimonials items={d.testimonials ?? []} tone="dark" />
        </div>
      </section>

      <CtaBand
        title="Let us plan your space together"
        text="Bring your floor plan to the studio and leave with layout options, material samples and an indicative cost."
        image={settings.seo?.og_image || p?.hero_image}
      />
    </>
  );
}
