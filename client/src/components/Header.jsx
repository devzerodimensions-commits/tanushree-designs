import { useEffect, useRef, useState } from 'react';
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
  { to: '/elica-chimney', label: 'Elica Chimney' },
  { to: '/our-work', label: 'Our Work' },
  { to: '/kitchen-price-calculator', label: 'Price Calculator' },
  { to: '/contact-us', label: 'Contact Us' },
];

export const Logo = LogoLockup;

export default function Header() {
  const { contact, settings, customPages } = useSite();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const innerRef = useRef(null);
  const navRef = useRef(null);
  const actionsRef = useRef(null);
  /** The nav's natural width, remembered from the last time it was on screen. */
  const wanted = useRef(0);
  const { pathname } = useLocation();

  const announce = settings?.announcement;

  // The fixed pages, then whatever the studio has built and chosen to show.
  const links = [
    ...NAV,
    ...customPages.map((p) => ({ to: `/${p.slug}`, label: p.title })),
  ];

  useScrollLock(open);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /*
   * Whether the bar can hold every link, measured rather than guessed.
   *
   * The studio adds pages to the menu from the admin, so neither the number
   * of links nor the length of their names is known here — a media query
   * cannot decide this, and a fixed allowance per link is wrong the moment
   * someone names a page "Frequently Asked Questions". So the nav is asked
   * how wide it would like to be and compared with the room left over.
   *
   * The nav clips rather than pushes (overflow: hidden in the stylesheet), so
   * scrollWidth still reports its full width while it is on screen. That
   * measurement is remembered, because once collapsed the nav is not rendered
   * and can no longer be asked.
   */
  useEffect(() => {
    const inner = innerRef.current;
    if (!inner) return undefined;

    const measure = () => {
      const nav = navRef.current;
      if (nav) wanted.current = Math.max(nav.scrollWidth, 0) || wanted.current;
      if (!wanted.current) return;

      const cs = getComputedStyle(inner);
      const gap = parseFloat(cs.gap) || 0;
      const room =
        inner.clientWidth -
        parseFloat(cs.paddingLeft) -
        parseFloat(cs.paddingRight) -
        // The logo is the first child; it renders its own element, so it is
        // measured in place rather than through a wrapper.
        (inner.firstElementChild?.offsetWidth ?? 0) -
        (actionsRef.current?.offsetWidth ?? 0) -
        gap * 2;

      // A little hysteresis so a pixel of rounding cannot make it flicker.
      setCollapsed((was) => (was ? wanted.current + 12 > room : wanted.current > room));
    };

    measure();

    // Both signals: the observer catches the header changing size on its own
    // (a longer phone number, a font finishing loading), and the window event
    // catches the ordinary case of someone resizing their browser.
    const ro = new ResizeObserver(measure);
    ro.observe(inner);
    window.addEventListener('resize', measure, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [links.length]);


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

      <header
        className={`header${scrolled ? ' header--scrolled' : ''}${
          collapsed ? ' header--collapsed' : ''
        }`}
      >
        <div className="shell header__inner" ref={innerRef}>
          <Logo />

          <nav className="nav" aria-label="Primary" ref={navRef}>
            {links.map((item) => (
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

          <div className="header__actions" ref={actionsRef}>
            <a className="header__phone" href={`tel:${contact.phone_raw || contact.phone}`}>
              <Icon.phone />
              {contact.phone}
            </a>
            <a
              className="btn btn--sm header__wa"
              href={`https://wa.me/${contact.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp us"
            >
              <Icon.whatsapp />
              {/* Dropped to the glyph alone where the header runs out of room,
                  so the phone number does not have to give up its line. */}
              <span>WhatsApp Us</span>
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

              {links.map((item) => (
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
