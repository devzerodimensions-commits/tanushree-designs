import { publicApi } from './api.js';

/**
 * Start fetching a page before it is asked for.
 *
 * Opening a page costs two round trips, one after the other: the browser
 * downloads the page's own code, and only once that has run does it ask for
 * the page's content. Nothing can overlap them, so the wait is the sum of
 * both — which is the pause between clicking a link and seeing the page.
 *
 * A pointer rests on a link for a couple of hundred milliseconds before the
 * click lands, and a finger touches down before it lifts. That is dead time,
 * and it is usually enough to cover both trips. Starting them then means the
 * page is frequently ready by the time the click arrives; when it is not,
 * the wait is however much was left rather than the whole of it.
 *
 * Nothing here changes what is displayed. A prefetch that is never used is
 * one wasted request, and a failed one is swallowed — the page will ask
 * again itself, and report the failure properly when it does.
 */

/** Which code and which content each public route needs. */
const ROUTES = {
  '/about-us': { load: () => import('../pages/About.jsx'), boot: 'about' },
  '/modular-kitchen': { load: () => import('../pages/ModularKitchen.jsx'), boot: 'modular-kitchen' },
  '/elica-chimney': { load: () => import('../pages/Elica.jsx'), boot: 'elica-chimney' },
  '/our-work': { load: () => import('../pages/OurWork.jsx'), boot: 'our-work' },
  '/contact-us': { load: () => import('../pages/Contact.jsx'), boot: 'contact' },
  '/kitchen-price-calculator': { load: () => import('../pages/Calculator.jsx') },
};

/** Routes already started, so resting on a link twice costs nothing. */
const started = new Set();

/**
 * Warm the code and content for `path`.
 *
 * Safe to call on every pointer movement: the first call for a route does
 * the work and the rest return immediately.
 */
export function prefetch(path) {
  const route = ROUTES[path];
  if (!route || started.has(path)) return;
  started.add(path);

  route.load().catch(() => started.delete(path));
  if (route.boot) publicApi.bootstrap(route.boot).catch(() => {});
}

/**
 * Handlers to spread onto a link.
 *
 * Hover and focus cover a mouse and a keyboard. `touchstart` covers a phone,
 * where there is no hover but still the time between the finger landing and
 * lifting.
 */
export const prefetchOn = (path) => ({
  onMouseEnter: () => prefetch(path),
  onFocus: () => prefetch(path),
  onTouchStart: () => prefetch(path),
});
