import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { publicApi } from '../lib/api.js';
import { useApi } from '../hooks/useApi.js';
import { useSite } from '../context/SiteContext.jsx';
import Icon from '../lib/icons.jsx';
import Img from '../components/Img.jsx';
import Seo from '../components/Seo.jsx';
import Reveal, { RevealGroup, RevealItem } from '../components/Reveal.jsx';
import { CtaBand, ProcessGrid, SectionHead, StatsBand, TrustStrip } from '../components/Sections.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import Testimonials from '../components/Testimonials.jsx';
import ContactForm from '../components/ContactForm.jsx';

/* ------------------------------------------------------------- hero */
const SLIDE_MS = 6500;

function Hero({ slides, fallback }) {
  const list = slides?.length ? slides : [fallback];
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (list.length < 2 || paused) return undefined;
    const id = setTimeout(() => setI((v) => (v + 1) % list.length), SLIDE_MS);
    return () => clearTimeout(id);
  }, [i, list.length, paused]);

  // Reaching for a button and having the slide change underneath is the most
  // annoying thing a hero carousel does. Hovering or tabbing to the buttons
  // or the dots holds the current slide; leaving them starts the clock again.
  const hold = {
    onMouseEnter: () => setPaused(true),
    onMouseLeave: () => setPaused(false),
    onFocus: () => setPaused(true),
    onBlur: () => setPaused(false),
  };

  const slide = list[i] ?? fallback;

  return (
    <section className="hero">
      <AnimatePresence mode="sync">
        <motion.div
          className="hero__media"
          key={slide.image}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ opacity: { duration: 1 }, scale: { duration: 7, ease: 'linear' } }}
        >
          {/* The hero is the largest image on the site, so it gets a srcset
              too — a phone should not download an 1800px file. */}
          <Img src={slide.image} alt="" eager sizes="100vw" />
        </motion.div>
      </AnimatePresence>

      <div className="shell hero__inner">
        <AnimatePresence mode="wait">
          <motion.div
            className="hero__content"
            key={slide.title}
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            {slide.eyebrow && <span className="eyebrow hero__eyebrow">{slide.eyebrow}</span>}
            <h1>{slide.title}</h1>
            <p className="hero__text">{slide.text}</p>
            <div className="hero__actions" {...hold}>
              <Link className="btn" to="/our-work">
                Explore Our Projects <Icon.arrowRight />
              </Link>
              <Link className="btn btn--outline-light" to="/contact-us">
                Book a Free Consultation
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {list.length > 1 && (
        <div className={`hero__dots${paused ? ' is-paused' : ''}`} {...hold}>
          {list.map((s, idx) => (
            <button
              key={s.image ?? idx}
              className={`hero__dot${idx === i ? ' is-active' : ''}`}
              onClick={() => setI(idx)}
              aria-label={`Slide ${idx + 1} of ${list.length}`}
              aria-current={idx === i}
            >
              {/* Fills over one slide's life, so a held slide is visibly held
                  rather than just slow. Restarts with each slide via the key. */}
              {idx === i && (
                <span
                  className="hero__dot-fill"
                  key={i}
                  style={{ animationDuration: `${SLIDE_MS}ms` }}
                />
              )}
            </button>
          ))}
        </div>
      )}

      <div className="hero__cue" aria-hidden="true">
        <i />
        Scroll
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- page */
export default function Home() {
  const { settings, contact } = useSite();

  // One request for the whole page instead of six.
  const { data: boot } = useApi(() => publicApi.bootstrap('home'), []);
  const d = boot?.data ?? {};

  const p = d.page;
  const s = p?.sections ?? {};

  return (
    <>
      <Seo
        title={p?.seo_title || settings.seo?.site_title}
        description={p?.seo_description || settings.seo?.description}
        image={settings.seo?.og_image}
      />

      <Hero
        slides={settings.hero_slides}
        fallback={{
          image: p?.hero_image,
          eyebrow: 'Modular Kitchens & Interiors',
          title: p?.hero_title || 'Designed for Living. Crafted for Your Home.',
          text: p?.hero_subtitle,
        }}
      />

      {/* trust strip lifted over the section edge */}
      <div className="shell" style={{ marginTop: -46, position: 'relative', zIndex: 5 }}>
        <TrustStrip items={settings.usps} />
      </div>

      {/* ------------------------------------------------------ intro */}
      <section className="section">
        <div className="shell intro">
          <div>
            <span className="eyebrow">{s.intro_eyebrow || 'About Us'}</span>
            <Reveal as="h2">{s.intro_title}</Reveal>
            <Reveal delay={0.08}>
              <p className="section-lead" style={{ marginTop: 20 }}>
                {s.intro_text}
              </p>
            </Reveal>

            <Reveal delay={0.14}>
              <ul className="checks">
                <li>
                  <Icon.check /> Practical layouts planned around how you actually use the space
                </li>
                <li>
                  <Icon.check /> Quality materials chosen to stand up to daily use
                </li>
                <li>
                  <Icon.check /> Attention to detail through design, manufacture and installation
                </li>
              </ul>
              <Link className="btn" to="/about-us">
                Get to Know Us <Icon.arrowRight />
              </Link>
            </Reveal>
          </div>

          <Reveal className="intro__media" from="left" delay={0.1}>
            <div className="intro__img">
              <Img src={s.story_image || p?.hero_image} alt="Interior designed by Tanushree Designs" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* --------------------------------------------------- services */}
      <section className="section section--sand">
        <div className="shell">
          <SectionHead
            center
            eyebrow={s.services_eyebrow || 'What We Do'}
            title={s.services_title}
            text={s.services_text}
          />

          <RevealGroup className="services-grid">
            {(d.services ?? []).map((svc) => {
              const Glyph = Icon[svc.icon] || Icon.kitchen;
              return (
                <RevealItem className="service-card" key={svc.id}>
                  <div className="service-card__media">
                    <Img src={svc.image_url} alt={svc.title} />
                  </div>
                  <div className="service-card__body">
                    <span className="service-card__badge">
                      <Glyph />
                    </span>
                    <h3>{svc.title}</h3>
                    <p>{svc.short_desc}</p>
                    <Link className="link-arrow service-card__link" to="/modular-kitchen">
                      Learn more <Icon.arrowRight />
                    </Link>
                  </div>
                </RevealItem>
              );
            })}
          </RevealGroup>
        </div>
      </section>

      <StatsBand stats={d.stats ?? []} />

      {/* ------------------------------------------------------- work */}
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
              eyebrow={s.work_eyebrow || 'Our Work'}
              title={s.work_title}
              text={s.work_text}
            />
            <Reveal delay={0.1} style={{ marginBottom: 'clamp(38px, 5vw, 64px)' }}>
              <Link className="btn btn--ghost" to="/our-work">
                View all projects <Icon.arrowRight />
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

      {/* ---------------------------------------------------- process */}
      <section className="section section--cream">
        <div className="shell">
          {/* No step count in the copy: there are three steps today and the
              studio can add a fourth from the admin without the heading
              going out of date. */}
          <SectionHead
            center
            eyebrow={s.process_eyebrow || 'How We Work'}
            title={s.process_title || 'From first sketch to final handle'}
            text={
              s.process_text ||
              'No surprises — here is exactly what happens, and when.'
            }
          />
          <ProcessGrid steps={d.process ?? []} />
        </div>
      </section>

      {/* ------------------------------------------------------ story */}
      <section className="section section--ink grain">
        <div className="shell intro">
          <div>
            <span className="eyebrow eyebrow--light">{s.story_eyebrow || 'Our Story'}</span>
            <Reveal as="h2">{s.story_title}</Reveal>
            <Reveal delay={0.08}>
              <p className="section-lead" style={{ marginTop: 20 }}>
                {s.story_text}
              </p>
              <Link className="btn btn--gold" to="/about-us" style={{ marginTop: 28 }}>
                Read our story <Icon.arrowRight />
              </Link>
            </Reveal>
          </div>
          <Reveal className="intro__media" from="left" delay={0.1}>
            <div className="intro__img">
              <Img src={s.cta_image || p?.hero_image} alt="" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------ testimonials */}
      <section className="section">
        <div className="shell">
          <SectionHead
            center
            eyebrow={s.testimonials_eyebrow || 'Testimonials'}
            title={s.testimonials_title || 'What our clients say'}
            text="Hear from homeowners who trusted us to transform their spaces."
          />
          <Testimonials items={d.testimonials ?? []} />
        </div>
      </section>

      <CtaBand
        title={s.cta_title || 'Ready to plan your kitchen?'}
        text={s.cta_text}
        image={s.cta_image || p?.hero_image}
      />

      {/* ---------------------------------------------------- contact */}
      <section className="section section--sand" id="contact">
        <div className="shell contact-grid">
          <div>
            <SectionHead
              eyebrow="Get in Touch"
              title="Our office"
              text="Visit our studio to explore design ideas, materials and finishes, and discuss how we can bring your project to life."
            />

            <div className="contact-cards">
              <div className="contact-card">
                <span className="contact-card__icon">
                  <Icon.pin />
                </span>
                <div>
                  <b>Address</b>
                  <span>{contact.address}</span>
                </div>
              </div>

              <div className="contact-card">
                <span className="contact-card__icon">
                  <Icon.phone />
                </span>
                <div>
                  <b>Contacts</b>
                  <a href={`tel:${contact.phone_raw || contact.phone}`}>{contact.phone}</a>
                  <br />
                  <a href={`mailto:${contact.email}`}>{contact.email}</a>
                </div>
              </div>

              <div className="contact-card">
                <span className="contact-card__icon">
                  <Icon.clock />
                </span>
                <div>
                  <b>Studio hours</b>
                  <span>{contact.hours}</span>
                </div>
              </div>
            </div>
          </div>

          <Reveal from="left">
            <ContactForm sourcePage="home" />
          </Reveal>
        </div>
      </section>
    </>
  );
}
