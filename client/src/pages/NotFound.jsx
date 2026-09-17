import { Link } from 'react-router-dom';
import Seo from '../components/Seo.jsx';

export default function NotFound() {
  return (
    <>
      <Seo title="Page not found | Tanushree Designs" />
      <div className="shell notfound">
        <div>
          <div className="notfound__code">404</div>
          <h2 style={{ marginBottom: 16 }}>This page has been redesigned away</h2>
          <p className="text-muted" style={{ marginBottom: 28, maxWidth: '44ch', marginInline: 'auto' }}>
            The link may be old, or the page may have moved. Let us get you back to something useful.
          </p>
          <div className="stack stack--center">
            <Link className="btn" to="/">
              Back to home
            </Link>
            <Link className="btn btn--ghost" to="/our-work">
              Browse our work
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
