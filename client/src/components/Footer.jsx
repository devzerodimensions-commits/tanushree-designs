import { Link } from 'react-router-dom';
import { useSite } from '../context/SiteContext.jsx';
import { NAV } from './Header.jsx';
import LogoLockup from './Logo.jsx';
import Icon from '../lib/icons.jsx';

const SOCIALS = [
  ['instagram', Icon.instagram, 'Instagram'],
  ['facebook', Icon.facebook, 'Facebook'],
  ['youtube', Icon.youtube, 'YouTube'],
  ['pinterest', Icon.pinterest, 'Pinterest'],
  ['linkedin', Icon.linkedin, 'LinkedIn'],
];

const SERVICE_LINKS = [
  ['Modular Kitchens', '/modular-kitchen'],
  ['Wardrobes & Storage', '/modular-kitchen#materials'],
  ['Kitchen Appliances', '/modular-kitchen#appliances'],
  ['Full Home Interiors', '/about-us'],
  ['Kitchen Price Calculator', '/kitchen-price-calculator'],
  ['Our Work', '/our-work'],
];

export default function Footer() {
  const { brand, contact, social } = useSite();
  const year = new Date().getFullYear();

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
          <h5>Explore</h5>
          <ul className="footer__links">
            {NAV.map((item) => (
              <li key={item.to}>
                <Link to={item.to}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h5>What We Do</h5>
          <ul className="footer__links">
            {SERVICE_LINKS.map(([label, to]) => (
              <li key={label}>
                <Link to={to}>{label}</Link>
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
