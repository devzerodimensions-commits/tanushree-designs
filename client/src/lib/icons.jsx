/**
 * Inline stroke icons — no icon-font dependency, all inherit currentColor.
 */
const S = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

const Svg = ({ children, ...rest }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...S} {...rest}>
    {children}
  </svg>
);

export const Icon = {
  arrowRight: (p) => (
    <Svg {...p}><path d="M5 12h14M13 6l6 6-6 6" /></Svg>
  ),
  arrowLeft: (p) => (
    <Svg {...p}><path d="M19 12H5M11 18l-6-6 6-6" /></Svg>
  ),
  arrowUp: (p) => (
    <Svg {...p}><path d="M12 19V5M6 11l6-6 6 6" /></Svg>
  ),
  check: (p) => (
    <Svg {...p}><path d="M20 6L9 17l-5-5" /></Svg>
  ),
  checkCircle: (p) => (
    <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M8.5 12.2l2.4 2.4 4.6-4.9" /></Svg>
  ),
  plus: (p) => (
    <Svg {...p}><path d="M12 5v14M5 12h14" /></Svg>
  ),
  close: (p) => (
    <Svg {...p}><path d="M18 6L6 18M6 6l12 12" /></Svg>
  ),
  phone: (p) => (
    <Svg {...p}>
      <path d="M21.5 16.9v2.6a1.7 1.7 0 01-1.9 1.7 17 17 0 01-7.4-2.6 16.7 16.7 0 01-5.2-5.2A17 17 0 014.4 6a1.7 1.7 0 011.7-1.9h2.6a1.7 1.7 0 011.7 1.5c.1.9.3 1.7.6 2.5a1.7 1.7 0 01-.4 1.8l-1.1 1.1a13.7 13.7 0 005.2 5.2l1.1-1.1a1.7 1.7 0 011.8-.4c.8.3 1.6.5 2.5.6a1.7 1.7 0 011.4 1.6z" />
    </Svg>
  ),
  mail: (p) => (
    <Svg {...p}><rect x="2.5" y="4.5" width="19" height="15" rx="2" /><path d="M3 6.5l9 6 9-6" /></Svg>
  ),
  pin: (p) => (
    <Svg {...p}><path d="M20 10.5c0 6-8 11.5-8 11.5s-8-5.5-8-11.5a8 8 0 1116 0z" /><circle cx="12" cy="10.5" r="2.8" /></Svg>
  ),
  clock: (p) => (
    <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.2 1.9" /></Svg>
  ),
  whatsapp: (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
      <path d="M17.5 14.4c-.3-.2-1.7-.9-2-1-.3-.1-.5-.2-.7.1s-.8 1-.9 1.2c-.2.2-.3.2-.6.1a8.2 8.2 0 01-2.4-1.5 9 9 0 01-1.7-2.1c-.2-.3 0-.5.1-.6l.5-.6a2 2 0 00.3-.5.6.6 0 000-.6L9 6.6c-.2-.5-.5-.5-.7-.5h-.6a1.2 1.2 0 00-.9.4A3.5 3.5 0 006 9a6.1 6.1 0 001.3 3.2 14 14 0 005.4 4.7c.7.3 1.3.5 1.8.6a4.3 4.3 0 002 .1 3.2 3.2 0 002.1-1.5 2.6 2.6 0 00.2-1.5c-.1-.1-.3-.2-.6-.3z" />
      <path d="M12 2a10 10 0 00-8.6 15L2 22l5.2-1.4A10 10 0 1012 2zm0 18.2a8.2 8.2 0 01-4.2-1.2l-.3-.2-3.1.8.8-3-.2-.3A8.2 8.2 0 1112 20.2z" />
    </svg>
  ),
  instagram: (p) => (
    <Svg {...p}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="3.8" /><circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" /></Svg>
  ),
  facebook: (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
      <path d="M14 9V7.2c0-.8.2-1.2 1.4-1.2H17V3h-2.6C11.6 3 10.6 4.4 10.6 6.9V9H9v3h1.6v9H14v-9h2.4l.4-3H14z" />
    </svg>
  ),
  youtube: (p) => (
    <Svg {...p}><rect x="2.5" y="5.5" width="19" height="13" rx="4" /><path d="M10.5 9.5l5 2.5-5 2.5z" fill="currentColor" stroke="none" /></Svg>
  ),
  linkedin: (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
      <path d="M6.9 21H3.6V9.2h3.3V21zM5.2 7.8A1.9 1.9 0 117.1 6a1.9 1.9 0 01-1.9 1.9zM21 21h-3.3v-5.7c0-1.4 0-3.2-1.9-3.2s-2.2 1.5-2.2 3.1V21H10.3V9.2h3.1v1.6h.1a3.5 3.5 0 013.1-1.7c3.3 0 3.9 2.2 3.9 5V21z" />
    </svg>
  ),
  pinterest: (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
      <path d="M12 2a10 10 0 00-3.6 19.3 9.6 9.6 0 01.1-2.9l1.2-5a3.6 3.6 0 01-.3-1.5c0-1.4.8-2.5 1.8-2.5a1.3 1.3 0 011.3 1.4 20 20 0 01-.8 3.4 1.5 1.5 0 001.5 1.8c1.8 0 3.2-1.9 3.2-4.7a4 4 0 00-4.3-4.2 4.5 4.5 0 00-4.6 4.5 4 4 0 00.8 2.4.3.3 0 01.1.3l-.3 1.1c0 .2-.2.3-.4.2-1.3-.6-2.1-2.5-2.1-4 0-3.3 2.4-6.3 6.9-6.3a6.1 6.1 0 016.4 6c0 3.6-2.2 6.4-5.4 6.4a2.8 2.8 0 01-2.4-1.2l-.6 2.5a11.6 11.6 0 01-1.3 2.8A10 10 0 1012 2z" />
    </svg>
  ),
  star: (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
      <path d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4l-5.8 3.1 1.1-6.5-4.7-4.6 6.5-.9z" />
    </svg>
  ),
  quote: (p) => (
    <Svg {...p}><path d="M9 7H5.5A2.5 2.5 0 003 9.5v3A2.5 2.5 0 005.5 15H7v2H4M20 7h-3.5A2.5 2.5 0 0014 9.5v3a2.5 2.5 0 002.5 2.5H18v2h-3" /></Svg>
  ),
  kitchen: (p) => (
    <Svg {...p}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 11h18M9 3v8M9 15h.01M15 15h3" /></Svg>
  ),
  wardrobe: (p) => (
    <Svg {...p}><rect x="4" y="2.5" width="16" height="19" rx="1.5" /><path d="M12 2.5v19M9.5 11h.01M14.5 11h.01" /></Svg>
  ),
  sofa: (p) => (
    <Svg {...p}><path d="M4 11V8a2 2 0 012-2h12a2 2 0 012 2v3" /><path d="M3 11a2 2 0 012 2v3h14v-3a2 2 0 112 2v4H3v-4a2 2 0 010-4z" /><path d="M7 11h10" /></Svg>
  ),
  appliance: (p) => (
    <Svg {...p}><path d="M5 12V6a3 3 0 013-3h8a3 3 0 013 3v6" /><path d="M3 12h18v3a3 3 0 01-3 3H6a3 3 0 01-3-3z" /><path d="M9 18v3M15 18v3" /></Svg>
  ),
  home: (p) => (
    <Svg {...p}><path d="M3 10.5L12 3l9 7.5V20a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 20z" /><path d="M9.5 21.5V13h5v8.5" /></Svg>
  ),
  compass: (p) => (
    <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M15.5 8.5l-2 5-5 2 2-5z" /></Svg>
  ),
  pencil: (p) => (
    <Svg {...p}><path d="M16.5 3.5a2.1 2.1 0 013 3L7.5 18.5l-4 1 1-4z" /></Svg>
  ),
  layers: (p) => (
    <Svg {...p}><path d="M12 2.8l9 4.7-9 4.7-9-4.7z" /><path d="M3 12.5l9 4.7 9-4.7M3 17l9 4.7 9-4.7" /></Svg>
  ),
  tools: (p) => (
    <Svg {...p}><path d="M14.5 6.5a3.5 3.5 0 004.7 4.7l-8 8a2.2 2.2 0 01-3.1-3.1z" /><path d="M6 6l3 3" /></Svg>
  ),
  shield: (p) => (
    <Svg {...p}><path d="M12 2.5l8 3v6c0 5-3.4 8.9-8 10-4.6-1.1-8-5-8-10v-6z" /><path d="M9 12l2.2 2.2L15.5 10" /></Svg>
  ),
  calendar: (p) => (
    <Svg {...p}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></Svg>
  ),
  tag: (p) => (
    <Svg {...p}><path d="M3 12.5V4a1 1 0 011-1h8.5l8 8-9.5 9.5z" /><circle cx="7.5" cy="7.5" r="1.2" /></Svg>
  ),
  award: (p) => (
    <Svg {...p}><circle cx="12" cy="9" r="6" /><path d="M8.5 14L7 22l5-2.6L17 22l-1.5-8" /></Svg>
  ),
  ruler: (p) => (
    <Svg {...p}><rect x="2" y="8" width="20" height="8" rx="1.5" /><path d="M6 8v3M10 8v4M14 8v3M18 8v4" /></Svg>
  ),
  grid: (p) => (
    <Svg {...p}><rect x="3" y="3" width="7.5" height="7.5" rx="1.5" /><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" /><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" /><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" /></Svg>
  ),
  image: (p) => (
    <Svg {...p}><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9.5" r="1.8" /><path d="M21 16l-5-5-6 6-3-3-4 4" /></Svg>
  ),
  upload: (p) => (
    <Svg {...p}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><path d="M7.5 8.5L12 4l4.5 4.5M12 4v12" /></Svg>
  ),
  users: (p) => (
    <Svg {...p}><circle cx="9" cy="8" r="3.6" /><path d="M2.5 20.5a6.5 6.5 0 0113 0" /><path d="M16 4.7a3.6 3.6 0 010 6.9M18 14.5a6.5 6.5 0 013.5 6" /></Svg>
  ),
  inbox: (p) => (
    <Svg {...p}><path d="M3 13h5l1.5 3h5L16 13h5" /><path d="M5.2 4.5h13.6a2 2 0 011.9 1.4L23 13v5a2 2 0 01-2 2H3a2 2 0 01-2-2v-5l2.3-7.1a2 2 0 011.9-1.4z" /></Svg>
  ),
  settings: (p) => (
    <Svg {...p}><circle cx="12" cy="12" r="3.2" /><path d="M19.4 14.6a1.6 1.6 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.6 1.6 0 00-1.8-.3 1.6 1.6 0 00-1 1.5v.2a2 2 0 11-4 0v-.1a1.6 1.6 0 00-1-1.5 1.6 1.6 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.6 1.6 0 00.3-1.8 1.6 1.6 0 00-1.5-1H3a2 2 0 110-4h.1a1.6 1.6 0 001.5-1 1.6 1.6 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.6 1.6 0 001.8.3H9a1.6 1.6 0 001-1.5V3a2 2 0 114 0v.1a1.6 1.6 0 001 1.5 1.6 1.6 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.6 1.6 0 00-.3 1.8V9a1.6 1.6 0 001.5 1h.2a2 2 0 110 4h-.1a1.6 1.6 0 00-1.5 1z" /></Svg>
  ),
  layout: (p) => (
    <Svg {...p}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" /></Svg>
  ),
  file: (p) => (
    <Svg {...p}><path d="M14 2.5H7a2 2 0 00-2 2v15a2 2 0 002 2h10a2 2 0 002-2V7.5z" /><path d="M14 2.5v5h5" /></Svg>
  ),
  chart: (p) => (
    <Svg {...p}><path d="M3 21h18M7 21V11M12 21V4M17 21v-6" /></Svg>
  ),
  trash: (p) => (
    <Svg {...p}><path d="M3.5 6h17M9 6V4.2A1.2 1.2 0 0110.2 3h3.6A1.2 1.2 0 0115 4.2V6M5.5 6l1 14a1.5 1.5 0 001.5 1.4h8a1.5 1.5 0 001.5-1.4l1-14" /></Svg>
  ),
  edit: (p) => (
    <Svg {...p}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 013 3L7.5 18.5l-4 1 1-4z" /></Svg>
  ),
  eye: (p) => (
    <Svg {...p}><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></Svg>
  ),
  eyeOff: (p) => (
    <Svg {...p}><path d="M10.6 5.2A9.9 9.9 0 0112 5c6.4 0 10 7 10 7a17.6 17.6 0 01-3.2 4.2M6.2 6.2A17.4 17.4 0 002 12s3.6 7 10 7a9.7 9.7 0 005.1-1.4M3 3l18 18" /></Svg>
  ),
  search: (p) => (
    <Svg {...p}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></Svg>
  ),
  logout: (p) => (
    <Svg {...p}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><path d="M16 17l5-5-5-5M21 12H9" /></Svg>
  ),
  external: (p) => (
    <Svg {...p}><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><path d="M15 3h6v6M10 14L21 3" /></Svg>
  ),
  alert: (p) => (
    <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5M12 16.2h.01" /></Svg>
  ),
  save: (p) => (
    <Svg {...p}><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /><path d="M17 21v-8H7v8M7 3v5h8" /></Svg>
  ),
  copy: (p) => (
    <Svg {...p}><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></Svg>
  ),
  chevronDown: (p) => (
    <Svg {...p}><path d="M6 9l6 6 6-6" /></Svg>
  ),
  sparkle: (p) => (
    <Svg {...p}><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" /><path d="M18.5 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z" /></Svg>
  ),
};

export default Icon;
