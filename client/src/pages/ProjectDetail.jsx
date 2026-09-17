import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { publicApi } from '../lib/api.js';
import { useApi } from '../hooks/useApi.js';
import Seo from '../components/Seo.jsx';
import Reveal, { RevealGroup, RevealItem } from '../components/Reveal.jsx';
import { CtaBand, SectionHead } from '../components/Sections.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import Lightbox from '../components/Lightbox.jsx';
import Icon from '../lib/icons.jsx';
import Img from '../components/Img.jsx';

export default function ProjectDetail() {
  const { slug } = useParams();
  const [lightbox, setLightbox] = useState(null);

  const { data, loading, error } = useApi(() => publicApi.project(slug), [slug]);

  const project = data?.data;
  const related = data?.related ?? [];

  if (loading) {
    return (
      <div className="page-loader">
        <span className="spinner spinner--dark" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="shell notfound">
        <div>
          <div className="notfound__code">404</div>
          <h2 style={{ marginBottom: 16 }}>We could not find that project</h2>
          <p className="text-muted" style={{ marginBottom: 26 }}>
            It may have been renamed or taken down.
          </p>
          <Link className="btn" to="/our-work">
            Back to our work
          </Link>
        </div>
      </div>
    );
  }

  const gallery = [
    project.cover_image,
    ...(project.images ?? []).map((i) => i.image_url),
  ].filter(Boolean);

  const specs = [
    ['Client', project.client_name],
    ['Location', project.location],
    ['Category', project.category_name],
    ['Area', project.area_sqft],
    ['Duration', project.duration],
    ['Completed', project.year],
  ].filter(([, v]) => v);

  return (
    <>
      <Seo
        title={`${project.title} | Tanushree Designs`}
        description={project.summary}
        image={project.cover_image}
      />

      {/* --------------------------------------------------- intro */}
      <section className="section section--tight" style={{ paddingBottom: 0 }}>
        <div className="shell">
          <nav className="crumbs" style={{ color: 'var(--muted)' }}>
            <Link to="/">Home</Link> / <Link to="/our-work">Our Work</Link> /{' '}
            <span style={{ color: 'var(--maroon)' }}>{project.title}</span>
          </nav>

          <Reveal style={{ maxWidth: 820, marginBottom: 40 }}>
            {project.category_name && <span className="eyebrow">{project.category_name}</span>}
            <h1 style={{ fontSize: 'clamp(2.1rem, 4.6vw, 3.6rem)' }}>{project.title}</h1>
            {project.summary && (
              <p className="section-lead" style={{ marginTop: 20 }}>
                {project.summary}
              </p>
            )}
          </Reveal>
        </div>
      </section>

      {/* -------------------------------------------------- gallery */}
      <section className="section section--tight">
        <div className="shell">
          <Reveal className="project-hero-grid" from="scale">
            {gallery.slice(0, 7).map((src, i) => (
              <div key={src + i} onClick={() => setLightbox(i)}>
                <Img src={src} alt={`${project.title} — view ${i + 1}`} eager={i === 0} />
              </div>
            ))}
          </Reveal>

          {gallery.length > 7 && (
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <button className="btn btn--ghost" onClick={() => setLightbox(7)}>
                View all {gallery.length} photos
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ---------------------------------------------------- specs */}
      <section className="section section--tight">
        <div className="shell">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
              gap: 'clamp(30px, 5vw, 70px)',
              alignItems: 'start',
            }}
            className="project-body"
          >
            <Reveal>
              <span className="eyebrow">The Brief</span>
              <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', marginBottom: 20 }}>
                What we did here
              </h2>
              <p className="text-muted" style={{ fontSize: '1.02rem' }}>
                {project.description}
              </p>

              {Array.isArray(project.tags) && project.tags.length > 0 && (
                <div className="pill-list">
                  {project.tags.map((t) => (
                    <span className="pill" key={t}>
                      {t}
                    </span>
                  ))}
                </div>
              )}

              <div className="stack" style={{ marginTop: 32 }}>
                <Link className="btn" to="/contact-us">
                  Plan something similar <Icon.arrowRight />
                </Link>
                <Link className="btn btn--ghost" to="/our-work">
                  Back to all work
                </Link>
              </div>
            </Reveal>

            <Reveal from="left" delay={0.1}>
              <dl className="spec-grid">
                {specs.map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- related */}
      {related.length > 0 && (
        <section className="section section--sand">
          <div className="shell">
            <SectionHead
              center
              eyebrow="More Projects"
              title="You might also like"
              text="Other spaces we have designed in the same spirit."
            />
            <RevealGroup className="work-grid">
              {related.map((proj) => (
                <RevealItem key={proj.id}>
                  <ProjectCard project={proj} />
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      )}

      <CtaBand
        title="Want a space like this?"
        text="Share your floor plan and budget — we will tell you honestly what is achievable."
        image={project.cover_image}
      />

      <Lightbox images={gallery} index={lightbox} onClose={() => setLightbox(null)} onChange={setLightbox} />

      <style>{`
        @media (max-width: 860px) {
          .project-body { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
