import { Link } from 'react-router-dom';
import { useSite } from '../context/SiteContext.jsx';

/** The supplied logo artwork, served from /public. */
const LOGO = '/logo.png';
const LOGO_2X = '/logo@2x.png';

/**
 * Brand lockup — the real logo file, unaltered.
 *
 * `tone="light"` is for dark backgrounds (footer, admin sidebar): the logo's
 * wordmark is charcoal, so it is placed on a white plate rather than being
 * recoloured, which keeps the artwork exactly as supplied.
 */
export function LogoLockup({ tone = 'dark', linked = true, className = '' }) {
  const { brand } = useSite();
  const name = brand?.name || 'Tanushree Designs';

  // An uploaded logo in Settings overrides the bundled file.
  const custom = brand?.logo_url;

  const img = custom ? (
    <img className="brand__img" src={custom} alt={name} />
  ) : (
    <img
      className="brand__img"
      src={LOGO}
      srcSet={`${LOGO} 768w, ${LOGO_2X} 1536w`}
      sizes="(max-width: 600px) 190px, 250px"
      width="768"
      height="174"
      alt={name}
      fetchPriority="high"
    />
  );

  const classes = `brand brand--${tone} ${className}`.trim();

  return linked ? (
    <Link to="/" className={classes} aria-label={name}>
      {img}
    </Link>
  ) : (
    <span className={classes}>{img}</span>
  );
}

export default LogoLockup;
