import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useSite } from '../context/SiteContext.jsx';
import { useScrollLock } from '../hooks/useApi.js';
import Icon from '../lib/icons.jsx';
import LogoLockup from './Logo.jsx';

export const NAV = [
  { to: '/', label: 'Home' },
  { to: '/about-us', label: 'About Us' },
  { to: '/modular-kitchen', label: 'Modular Kitchen' },
  { to: '/our-work', label: 'Our Work' },
  { to: '/kitchen-price-calculator', label: 'Price Calculator' },
  { to: '/contact-us', label: 'Contact Us' },
];

export const Logo = LogoLockup;

export default function Header() {
  const { contact, settings } = useSite();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useScrollLock(open);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const announce = settings?.announcement;

  return (
    <>
      {announce?.enabled && announce?.text && (
        <div className="announce">
          <div className="shell announce__inner">
            <span>{announce.text}</span>
            {announce.link_url && announce.link_text && (
              <Link to={announce.link_url}>{announce.link_text}</Link>
            )}
          </div>
        </div>
      )}

      <header className={`header${scrolled ? ' header--scrolled' : ''}`}>
        <div className="shell header__inner">
          <Logo />

          <nav className="nav" aria-label="Primary">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => `nav__link${isActive ? ' is-active' : ''}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="header__actions">
            <a className="header__phone" href={`tel:${contact.phone_raw || contact.phone}`}>
              <Icon.phone />
              {contact.phone}
            </a>
            <a
              className="btn btn--sm"
              href={`https://wa.me/${contact.whatsapp}`}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp Us
            </a>
            <button
              type="button"
              className={`burger${open ? ' is-open' : ''}`}
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="drawer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="drawer__scrim" onClick={() => setOpen(false)} />
            <motion.div
              className="drawer__panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="drawer__head">
                <Logo />
                <button className="drawer__close" onClick={() => setOpen(false)} aria-label="Close menu">
                  <Icon.close style={{ width: 18, height: 18 }} />
                </button>
              </div>

              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) => `drawer__link${isActive ? ' is-active' : ''}`}
                >
                  {item.label}
                </NavLink>
              ))}

              <div className="drawer__foot">
                <a className="btn btn--block" href={`tel:${contact.phone_raw || contact.phone}`}>
                  Call {contact.phone}
                </a>
                <a
                  className="btn btn--ghost btn--block"
                  href={`https://wa.me/${contact.whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp Us
                </a>
                <p className="drawer__meta">{contact.address}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
