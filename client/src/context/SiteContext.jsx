import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { publicApi } from '../lib/api.js';

const SiteContext = createContext(null);

/** Sensible defaults so the site still renders if the API is asleep. */
const FALLBACK = {
  brand: {
    name: 'Tanushree Designs',
    tagline: 'Modular Kitchen Concepts',
    logo_url: '',
    colors: {
      primary: '#7D1416',
      primary_dark: '#5A0E10',
      secondary: '#A3302F',
      navy: '#16165F',
      grey: '#8C8C8C',
      cream: '#F1EFEC',
      ink: '#2B2B2B',
      muted: '#6D6A67',
    },
  },
  contact: {
    phone: '+91 98816 97860',
    phone_raw: '919881697860',
    whatsapp: '919881697860',
    email: 'info@tanushreedesigns.in',
    address:
      'C-103, Sarkhej - Gandhinagar Hwy, near Gota Flyover, Vasant Nagar, Ognaj, Ahmedabad, Gujarat 380060',
    hours: 'Mon - Sat, 10:00 am - 8:00 pm',
    map_embed: 'https://www.google.com/maps?q=Ognaj+Ahmedabad&output=embed',
  },
  social: {},
  announcement: { enabled: false },
  usps: [],
  hero_slides: [],
  seo: {},
};

/** Map the editable brand colours onto the CSS custom properties. */
function applyTheme(colors = {}) {
  const root = document.documentElement.style;
  const map = {
    primary: '--maroon',
    primary_dark: '--maroon-dark',
    secondary: '--maroon-soft',
    navy: '--navy',
    grey: '--grey',
    cream: '--cream',
    ink: '--ink',
    muted: '--muted',
  };
  for (const [key, cssVar] of Object.entries(map)) {
    if (colors[key]) root.setProperty(cssVar, colors[key]);
  }
}

export function SiteProvider({ children }) {
  const [settings, setSettings] = useState(FALLBACK);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    publicApi
      .settings()
      .then(({ data }) => {
        if (!alive) return;
        const merged = { ...FALLBACK, ...data };
        setSettings(merged);
        applyTheme(merged.brand?.colors);
      })
      .catch(() => {
        /* keep fallback — the site should never blank out */
      })
      .finally(() => alive && setReady(true));
    return () => {
      alive = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      settings,
      ready,
      brand: settings.brand ?? FALLBACK.brand,
      contact: settings.contact ?? FALLBACK.contact,
      social: settings.social ?? {},
      refresh: () =>
        publicApi.settings().then(({ data }) => {
          setSettings({ ...FALLBACK, ...data });
          applyTheme(data.brand?.colors);
        }),
    }),
    [settings, ready]
  );

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export const useSite = () => {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error('useSite must be used inside <SiteProvider>');
  return ctx;
};
