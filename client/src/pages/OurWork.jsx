import { useMemo, useState } from 'react';
import { publicApi } from '../lib/api.js';
import { useApi } from '../hooks/useApi.js';
import Seo from '../components/Seo.jsx';
import Reveal, { RevealGroup, RevealItem } from '../components/Reveal.jsx';
import { Banner, CtaBand } from '../components/Sections.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import Icon from '../lib/icons.jsx';

export default function OurWork() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const { data: boot, loading } = useApi(() => publicApi.bootstrap('our-work'), []);
  const d = boot?.data ?? {};

  const p = d.page;

  const shown = useMemo(() => {
    let list = d.projects ?? [];
    if (filter !== 'all') list = list.filter((x) => x.category_slug === filter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (x) =>
          x.title.toLowerCase().includes(q) ||
          (x.location || '').toLowerCase().includes(q) ||
          (Array.isArray(x.tags) ? x.tags.join(' ').toLowerCase() : '').includes(q)
      );
    }
    return list;
  }, [d.projects, filter, search]);

  const counts = useMemo(() => {
    const list = d.projects ?? [];
    return list.reduce((acc, x) => {
      acc[x.category_slug] = (acc[x.category_slug] || 0) + 1;
      return acc;
    }, {});
  }, [d.projects]);

  return (
    <>
      <Seo
        title={p?.seo_title || 'Our Work | Tanushree Designs'}
        description={p?.seo_description}
        image={p?.hero_image}
      />

      <Banner
        title={p?.hero_title || 'Our Work'}
        text={p?.hero_subtitle}
        image={p?.hero_image}
        crumbs={['Our Work']}
      />

      <section className="section">
        <div className="shell">
          <Reveal
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 18,
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 34,
            }}
          >
            <div className="work-filters" style={{ marginBottom: 0 }}>
              <button
                type="button"
                className={`filter-chip${filter === 'all' ? ' is-active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All Projects ({d.projects?.length ?? 0})
              </button>
              {(d.categories ?? []).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`filter-chip${filter === c.slug ? ' is-active' : ''}`}
                  onClick={() => setFilter(c.slug)}
                >
                  {c.name} ({counts[c.slug] ?? 0})
                </button>
              ))}
            </div>

            <div className="a-search" style={{ maxWidth: 280 }}>
              <Icon.search />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects or areas"
                aria-label="Search projects"
              />
            </div>
          </Reveal>

          {loading ? (
            <div className="work-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ aspectRatio: '4 / 3.2', borderRadius: 14 }} />
              ))}
            </div>
          ) : (
            <RevealGroup className="work-grid" key={`${filter}-${search}`}>
              {shown.map((proj) => (
                <RevealItem key={proj.id}>
                  <ProjectCard project={proj} />
                </RevealItem>
              ))}

              {!shown.length && (
                <div className="work-empty">
                  <p>
                    No projects match that filter yet.
                    <br />
                    Try another category or clear your search.
                  </p>
                </div>
              )}
            </RevealGroup>
          )}
        </div>
      </section>

      <CtaBand
        title="Yours could be next"
        text="Tell us about your space and we will show you what is possible within your budget."
        image={p?.hero_image}
      />
    </>
  );
}
