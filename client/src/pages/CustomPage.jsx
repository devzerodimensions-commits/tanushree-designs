import { Link, useParams } from 'react-router-dom';
import { publicApi } from '../lib/api.js';
import { useApi } from '../hooks/useApi.js';
import Seo from '../components/Seo.jsx';
import { Banner } from '../components/Sections.jsx';
import PageBlocks from '../components/PageBlocks.jsx';
import NotFound from './NotFound.jsx';

/**
 * A page the studio built in the admin out of blocks.
 *
 * Every block is drawn with the same components the hand-built pages use, so
 * a page assembled here cannot end up looking like a different website. An
 * unknown block type is skipped rather than crashing the page — old content
 * stays readable if a block is ever retired.
 */

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

      <PageBlocks blocks={page.blocks} />
    </>
  );
}
