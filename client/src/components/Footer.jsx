import { Link } from 'react-router-dom';
import { useSite } from '../context/SiteContext.jsx';
import { NAV, cleanLinks } from './Header.jsx';
import LogoLockup from './Logo.jsx';
import Icon from '../lib/icons.jsx';

const SOCIALS = [
  ['instagram', Icon.instagram, 'Instagram'],
  ['facebook', Icon.facebook, 'Facebook'],
  ['youtube', Icon.youtube, 'YouTube'],
  ['pinterest', Icon.pinterest, 'Pinterest'],
  ['linkedin', Icon.linkedin, 'LinkedIn'],
];

/**
 * Where the What We Do column comes from if the studio has not set one.
 * The live list is edited under Settings -> Menus.
 *
 * Three entries used to point somewhere else: "Wardrobes & Storage" and
 * "Kitchen Appliances" jumped to anchors part-way down the kitchen page, and
 * "Full Home Interiors" went to About Us. Every link now goes to a page that
 * is about the thing it names.
 */
const SERVICE_LINKS = [
  { label: 'Modular Kitchens', to: '/modular-kitchen' },
  { label: 'Elica Chimney', to: '/elica-chimney' },
  { label: 'Kitchen Price Calculator', to: '/kitchen-price-calculator' },
  { label: 'Our Work', to: '/our-work' },
];

export default function Footer() {
  const { brand, contact, social, settings, customPages } = useSite();
  const year = new Date().getFullYear();

  const menus = settings?.menus ?? {};
  const explore = cleanLinks(menus.header, NAV);
  const services = cleanLinks(menus.footer_services, SERVICE_LINKS);
  const pages = customPages.filter((p) => !explore.some((l) => l.to === `/${p.slug}`));

  return (
    <footer className="footer">
      <div className="shell footer__top">
        <div>
          <LogoLockup tone="light" />
          <p className="footer__about">
            Modular kitchens, wardrobes and complete interior solutions designed and installed in
            Ahmedabad — thoughtful design, smart functionality and timeless aesthetics.
          </p>
          <div className="socials">
            {SOCIALS.filter(([key]) => social?.[key]).map(([key, IconCmp, label]) => (
              <a key={key} href={social[key]} target="_blank" rel="noreferrer" aria-label={label}>
                <IconCmp />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h5>{menus.footer_explore_title || 'Explore'}</h5>
          <ul className="footer__links">
            {[...explore, ...pages.map((p) => ({ to: `/${p.slug}`, label: p.title }))].map(
              (item) => (
                <li key={item.to}>
                  <Link to={item.to}>{item.label}</Link>
                </li>
              )
            )}
          </ul>
        </div>

        <div>
          <h5>{menus.footer_services_title || 'What We Do'}</h5>
          <ul className="footer__links">
            {services.map((item) => (
              <li key={`${item.label}-${item.to}`}>
                <Link to={item.to}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h5>Visit The Studio</h5>
          <ul className="footer__contact">
            <li>
              <Icon.pin />
              <span>{contact.address}</span>
            </li>
            <li>
              <Icon.phone />
              <a href={`tel:${contact.phone_raw || contact.phone}`}>{contact.phone}</a>
            </li>
            <li>
              <Icon.mail />
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
            </li>
            <li>
              <Icon.clock />
              <span>{contact.hours}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="shell footer__bottom">
        <span>
          © {year} {brand?.name || 'Tanushree Designs'}. All rights reserved.
        </span>
        <span>
          <Link to="/admin">Admin Panel</Link>
        </span>
      </div>
    </footer>
  );
}
