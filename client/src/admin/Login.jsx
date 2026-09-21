import { useState } from 'react';
import '../styles/admin.css';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Icon from '../lib/icons.jsx';
import Seo from '../components/Seo.jsx';

const ART = 'https://images.unsplash.com/photo-1600489000022-c2086d79f9d4?auto=format&fit=crop&w=1200&q=80';

export default function Login() {
  const { user, login, checking } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  if (checking) {
    return (
      <div className="page-loader" style={{ minHeight: '100vh' }}>
        <span className="spinner spinner--dark" />
      </div>
    );
  }

  if (user) return <Navigate to={location.state?.from || '/admin'} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(email, password);
      navigate(location.state?.from || '/admin', { replace: true });
    } catch (err) {
      setError(err.message || 'Could not sign you in');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Seo title="Admin sign in | Tanushree Designs" />
      <div className="login-screen">
        <div className="login-art">
          <img src={ART} alt="" />
          <div className="login-art__copy">
            <span className="eyebrow eyebrow--light">Tanushree Designs</span>
            <h2>Everything on the website, editable from here.</h2>
            <p>
              Projects, services, kitchen layouts, materials, testimonials, page copy, brand colours
              and enquiries — all in one place.
            </p>
          </div>
        </div>

        <div className="login-panel">
          <form className="login-form" onSubmit={submit}>
            <h1>Welcome back</h1>
            <p>Sign in to manage your website content.</p>

            {error && (
              <div className="form-alert form-alert--err">
                <Icon.alert />
                <span>{error}</span>
              </div>
            )}

            <div className="a-field">
              <label htmlFor="li-email">Email address</label>
              <input
                id="li-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="username"
                required
              />
            </div>

            <div className="a-field">
              <label htmlFor="li-pass">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="li-pass"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--muted)',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  {showPass ? (
                    <Icon.eyeOff style={{ width: 17, height: 17 }} />
                  ) : (
                    <Icon.eye style={{ width: 17, height: 17 }} />
                  )}
                </button>
              </div>
            </div>

            <button className="btn btn--block" type="submit" disabled={busy} style={{ marginTop: 8 }}>
              {busy ? <span className="spinner" /> : null}
              {busy ? 'Signing in…' : 'Sign in'}
            </button>

            {/* Development only. Printing the seeded credentials on a public
                login page would hand an attacker the admin email and a
                password to try, so this never ships in a production build. */}
            {import.meta.env.DEV && (
              <div className="login-hint">
                Default seeded login — <code>admin@tanushreedesigns.in</code> /{' '}
                <code>Admin@12345</code>. Change it under Settings → Account after your first
                sign-in.
              </div>
            )}

            <p style={{ marginTop: 22, fontSize: '0.85rem', textAlign: 'center' }}>
              <Link to="/" className="link-arrow" style={{ textTransform: 'none', letterSpacing: 0 }}>
                ← Back to the website
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}
