import { publicApi } from '../lib/api.js';
import { useApi } from '../hooks/useApi.js';
import { useSite } from '../context/SiteContext.jsx';
import Icon from '../lib/icons.jsx';
import Seo from '../components/Seo.jsx';
import PageBlocks from '../components/PageBlocks.jsx';
import Reveal from '../components/Reveal.jsx';
import { Banner, SectionHead } from '../components/Sections.jsx';
import ContactForm from '../components/ContactForm.jsx';
import Faq from '../components/Faq.jsx';

export default function Contact() {
  const { contact } = useSite();
  const { data: boot } = useApi(() => publicApi.bootstrap('contact'), []);
  const d = boot?.data ?? {};

  const p = d.page;
  const s = p?.sections ?? {};

  const mapUrl =
    contact.map_embed ||
    `https://www.google.com/maps?q=${encodeURIComponent(contact.address || 'Ahmedabad')}&output=embed`;

  return (
    <>
      <Seo
        title={p?.seo_title || 'Contact Us | Tanushree Designs'}
        description={p?.seo_description}
        image={p?.hero_image}
      />

      <Banner
        ready={Boolean(boot)}
        title={p?.hero_title || 'Contact Us'}
        text={p?.hero_subtitle}
        image={p?.hero_image}
        crumbs={['Contact Us']}
      />

      <section className="section">
        <div className="shell contact-grid">
          <div>
            <SectionHead
              eyebrow="Get in Touch"
              title={s.visit_title || 'Visit the studio'}
              text={s.visit_text}
            />

            <div className="contact-cards">
              <a
                className="contact-card"
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.address || '')}`}
                target="_blank"
                rel="noreferrer"
              >
                <span className="contact-card__icon">
                  <Icon.pin />
                </span>
                <div>
                  <b>Studio address</b>
                  <span>{contact.address}</span>
                </div>
              </a>

              <a className="contact-card" href={`tel:${contact.phone_raw || contact.phone}`}>
                <span className="contact-card__icon">
                  <Icon.phone />
                </span>
                <div>
                  <b>Call us</b>
                  <span>{contact.phone}</span>
                </div>
              </a>

              <a className="contact-card" href={`mailto:${contact.email}`}>
                <span className="contact-card__icon">
                  <Icon.mail />
                </span>
                <div>
                  <b>Email us</b>
                  <span>{contact.email}</span>
                </div>
              </a>

              <a
                className="contact-card"
                href={`https://wa.me/${contact.whatsapp}`}
                target="_blank"
                rel="noreferrer"
              >
                <span className="contact-card__icon" style={{ background: '#25d366' }}>
                  <Icon.whatsapp />
                </span>
                <div>
                  <b>WhatsApp</b>
                  <span>Send your floor plan directly</span>
                </div>
              </a>

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
            <h3 style={{ marginBottom: 10 }}>{s.form_title || 'Tell us about your project'}</h3>
            <p className="text-muted" style={{ marginBottom: 26, fontSize: '0.95rem' }}>
              {s.form_text}
            </p>
            <ContactForm sourcePage="contact" />
          </Reveal>
        </div>
      </section>

      {/* -------------------------------------------------------- map */}
      <section className="section section--tight" style={{ paddingTop: 0 }} id="map">
        <div className="shell">
          <Reveal className="map-block" from="scale">
            <div className="map-frame">
              <iframe
                src={mapUrl}
                title="Tanushree Designs studio on Google Maps"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>

            <div className="map-bar">
              <div className="map-bar__where">
                <span className="map-bar__icon">
                  <Icon.pin />
                </span>
                <div>
                  <b>Tanushree Designs</b>
                  <span>{contact.address}</span>
                </div>
              </div>
              <a
                className="btn btn--sm"
                href={
                  contact.map_link ||
                  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(contact.address || '')}`
                }
                target="_blank"
                rel="noreferrer"
              >
                Get Directions <Icon.arrowRight />
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* -------------------------------------------------------- faq */}
      <section className="section section--cream">
        <div className="shell">
          <SectionHead
            center
            eyebrow="Questions"
            title="Answers to what people ask us first"
          />
          <Faq items={d.faqs ?? []} />
        </div>
      </section>
      {/* Anything the studio has added to this page in the admin. */}
      <PageBlocks blocks={p?.blocks} />
    </>
  );
}
