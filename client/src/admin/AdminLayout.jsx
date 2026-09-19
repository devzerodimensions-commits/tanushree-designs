import { useEffect, useState } from 'react';
import { Link, NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useSite } from '../context/SiteContext.jsx';
import { adminApi } from '../lib/api.js';
import Icon from '../lib/icons.jsx';
import LogoLockup from '../components/Logo.jsx';
import { ToastProvider } from './ui.jsx';

const NAV = [
  {
    label: 'Overview',
    items: [{ to: '/admin', end: true, label: 'Dashboard', icon: 'chart' }],
  },
  {
    label: 'Content',
    items: [
      { to: '/admin/projects', label: 'Projects', icon: 'grid' },
      { to: '/admin/services', label: 'Services', icon: 'kitchen' },
      { to: '/admin/kitchen-layouts', label: 'Kitchen Layouts', icon: 'layout' },
      { to: '/admin/chimney-types', label: 'Chimney Types', icon: 'appliance' },
      { to: '/admin/materials', label: 'Materials', icon: 'layers' },
      { to: '/admin/categories', label: 'Categories', icon: 'tag' },
      { to: '/admin/testimonials', label: 'Testimonials', icon: 'quote' },
      { to: '/admin/team', label: 'Team', icon: 'users' },
      { to: '/admin/process', label: 'Process Steps', icon: 'compass' },
      { to: '/admin/stats', label: 'Stats', icon: 'award' },
      { to: '/admin/faqs', label: 'FAQs', icon: 'file' },
    ],
  },
  {
    label: 'Calculator',
    items: [
      { to: '/admin/calc-packages', label: 'Packages & Rates', icon: 'layers' },
      { to: '/admin/calc-layouts', label: 'Layouts', icon: 'layout' },
      { to: '/admin/calc-addons', label: 'Add-ons', icon: 'appliance' },
      { to: '/admin/quotes', label: 'Estimates', icon: 'chart', badge: 'quotes' },
    ],
  },
  {
    label: 'Site',
    items: [
      { to: '/admin/pages', label: 'Page Content', icon: 'edit' },
      { to: '/admin/media', label: 'Media Library', icon: 'image' },
      { to: '/admin/enquiries', label: 'Enquiries', icon: 'inbox', badge: 'enquiries' },
      { to: '/admin/settings', label: 'Settings', icon: 'settings' },
    ],
  },
];

export default function AdminLayout() {
  const { user, checking, logout } = useAuth();
  const { brand } = useSite();
  const [open, setOpen] = useState(false);
  const [newCount, setNewCount] = useState(0);
  const [quotesCount, setQuotesCount] = useState(0);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!user) return undefined;
    const load = () =>
      adminApi
        .dashboard()
        .then(({ counts }) => {
          setNewCount(counts?.enquiries_new ?? 0);
          setQuotesCount(counts?.quotes_new ?? 0);
        })
        .catch(() => {});
    load();
    const id = setInterval(load, 60000);
    return () => clearInterval(id);
  }, [user, pathname]);

  if (checking) {
    return (
      <div className="page-loader" style={{ minHeight: '100vh' }}>
        <span className="spinner spinner--dark" />
      </div>
    );
  }

  if (!user) return <Navigate to="/admin/login" replace state={{ from: pathname }} />;

  const initials = (user.name || 'A')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <ToastProvider>
      <div className={`admin${open ? ' is-open' : ''}`}>
        {open && <div className="admin-scrim" onClick={() => setOpen(false)} />}

        <aside className="admin-side">
          <div className="admin-side__brand">
            <LogoLockup tone="light" linked={false} />
          </div>

          <nav className="admin-nav">
            {NAV.map((group) => (
              <div key={group.label}>
                <div className="admin-nav__label">{group.label}</div>
                {group.items.map((item) => {
                  const Glyph = Icon[item.icon] || Icon.file;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) => `admin-nav__link${isActive ? ' is-active' : ''}`}
                    >
                      <Glyph />
                      {item.label}
                      {item.badge === 'enquiries' && newCount > 0 && (
                        <span className="admin-nav__badge">{newCount}</span>
                      )}
                      {item.badge === 'quotes' && quotesCount > 0 && (
                        <span className="admin-nav__badge">{quotesCount}</span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </nav>

          <div className="admin-side__foot">
            <Link className="admin-side__site" to="/" target="_blank">
              <Icon.external /> View live site
            </Link>
            <div className="admin-side__user">
              <span className="admin-side__avatar">{initials}</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.name}
                </div>
                <small>{user.role}</small>
              </div>
            </div>
            <button className="admin-side__out" onClick={logout}>
              <Icon.logout /> Sign out
            </button>
          </div>
        </aside>

        <div className="admin-main">
          <Outlet context={{ setOpen }} />
        </div>
      </div>
    </ToastProvider>
  );
}

/** Sticky page header used by every admin screen. */
export function AdminHeader({ title, subtitle, children, onMenu }) {
  return (
    <div className="admin-top">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
        <button className="admin-burger" onClick={onMenu} aria-label="Open menu">
          <span />
          <span />
          <span />
        </button>
        <div style={{ minWidth: 0 }}>
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>
      <div className="admin-top__actions">{children}</div>
    </div>
  );
}
