import { Link, useParams } from 'react-router-dom';
import { publicApi } from '../lib/api.js';
import { useApi } from '../hooks/useApi.js';
import Icon from '../lib/icons.jsx';
import Img from '../components/Img.jsx';
import Seo from '../components/Seo.jsx';
import Reveal, { RevealGroup, RevealItem } from '../components/Reveal.jsx';
import { Banner, SectionHead } from '../components/Sections.jsx';
import NotFound from './NotFound.jsx';

/**
 * A page the studio built in the admin out of blocks.
 *
 * Every block is drawn with the same components the hand-built pages use, so
 * a page assembled here cannot end up looking like a different website. An
 * unknown block type is skipped rather than crashing the page — old content
 * stays readable if a block is ever retired.
 */

/** Split a textarea into paragraphs on blank lines. */
const paragraphs = (text) =>
  String(text || '')
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

function Paragraphs({ text, className = 'text-muted' }) {
  const parts = paragraphs(text);
  if (!parts.length) return null;
  return parts.map((p, i) => (
    <p key={i} className={className} style={i ? { marginTop: 14 } : undefined}>
      {p}
    </p>
  ));
}

function Block({ block }) {
  const b = block ?? {};

  switch (b.type) {
    case 'heading':
      return (
        <section className={`section${b.tone === 'cream' ? ' section--cream' : ''}`}>
          <div className="shell">
            <SectionHead center eyebrow={b.eyebrow} title={b.title} text={b.text} />
          </div>
        </section>
      );

    case 'text':
      return (
        <section className={`section${b.tone === 'cream' ? ' section--cream' : ''}`}>
          <div className="shell">
            <Reveal style={{ maxWidth: '70ch', marginInline: b.centred ? 'auto' : undefined }}>
              {b.title && <h2 style={{ marginBottom: 18 }}>{b.title}</h2>}
              <Paragraphs text={b.body} />
            </Reveal>
          </div>
        </section>
      );

    case 'image':
      return (
        <section className={`section${b.tone === 'cream' ? ' section--cream' : ''}`}>
          <div className="shell">
            <Reveal from="scale">
              <div className="page-figure">
                <Img src={b.image} alt={b.alt || ''} ratio={b.ratio || '16 / 9'} />
              </div>
              {b.caption && <p className="page-figure__caption">{b.caption}</p>}
            </Reveal>
          </div>
        </section>
      );

    case 'imageText':
      return (
        <section className={`section${b.tone === 'cream' ? ' section--cream' : ''}`}>
          <div className="shell">
            <Reveal className={`feature-row${b.flip ? ' feature-row--flip' : ''}`}>
              <div className="feature-row__media">
                <Img src={b.image} alt="" />
              </div>
              <div>
                {b.eyebrow && <span className="eyebrow">{b.eyebrow}</span>}
                {b.title && <h2 style={{ marginBottom: 16 }}>{b.title}</h2>}
                <Paragraphs text={b.body} />
                {b.button_label && b.button_link && (
                  <div className="stack" style={{ marginTop: 26 }}>
                    <Link className="btn" to={b.button_link}>
                      {b.button_label} <Icon.arrowRight />
                    </Link>
                  </div>
                )}
              </div>
            </Reveal>
          </div>
        </section>
      );

    case 'points':
      return (
        <section className={`section${b.tone === 'cream' ? ' section--cream' : ''}`}>
          <div className="shell">
            {(b.title || b.eyebrow) && (
              <SectionHead center eyebrow={b.eyebrow} title={b.title} text={b.text} />
            )}
            <Reveal style={{ maxWidth: '70ch', marginInline: 'auto' }}>
              <ul className="checks">
                {(b.items ?? []).map((item, i) => (
                  <li key={i}>
                    <Icon.check /> {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>
      );

    case 'cards':
      return (
        <section className={`section${b.tone === 'cream' ? ' section--cream' : ''}`}>
          <div className="shell">
            {(b.title || b.eyebrow) && (
              <SectionHead center eyebrow={b.eyebrow} title={b.title} text={b.text} />
            )}
            <RevealGroup className="layout-grid">
              {(b.items ?? []).map((item, i) => (
                <RevealItem className="layout-card" key={i}>
                  {item.image && (
                    <div className="layout-card__media">
                      <Img src={item.image} alt={item.title || ''} />
                    </div>
                  )}
                  <div className="layout-card__body">
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      );

    case 'cta':
      return (
        <section className="section section--tight">
          <div className="shell">
            <Reveal className="cta-band" from="scale">
              {b.image && (
                <div className="cta-band__media">
                  <Img src={b.image} alt="" />
                </div>
              )}
              <div className="cta-band__inner">
                <div>
                  <h2>{b.title}</h2>
                  {b.text && <p>{b.text}</p>}
                </div>
                {b.button_label && b.button_link && (
                  <div className="stack">
                    <Link className="btn btn--light" to={b.button_link}>
                      {b.button_label}
                    </Link>
                  </div>
                )}
              </div>
            </Reveal>
          </div>
        </section>
      );

    default:
      return null;
  }
}

export default function CustomPage() {
  const { slug } = useParams();
  const { data, loading, error } = useApi(() => publicApi.page(slug), [slug]);

  if (loading) {
    return (
      <div className="page-loader">
        <span className="spinner spinner--dark" />
      </div>
    );
  }

  const page = data?.data;
  // A slug that is not a page at all, or a built-in page reached through this
  // catch-all, is a 404 rather than an empty shell.
  if (error || !page || !page.is_custom) return <NotFound />;

  const blocks = Array.isArray(page.blocks) ? page.blocks : [];

  return (
    <>
      <Seo
        title={page.seo_title || `${page.title} | Tanushree Designs`}
        description={page.seo_description}
        image={page.hero_image}
      />

      <Banner
        title={page.hero_title || page.title}
        text={page.hero_subtitle}
        image={page.hero_image}
        crumbs={[page.title]}
      />

      {blocks.map((block, i) => (
        <Block key={block.id ?? i} block={block} />
      ))}
    </>
  );
}
