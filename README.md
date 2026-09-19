# Tanushree Designs — Website & Admin Panel

A modern rebuild of [tanushreedesigns.in](https://tanushreedesigns.in) using the
existing brand identity, with every piece of content editable from a
fully dynamic admin panel.

| Layer     | Stack                                                          |
| --------- | -------------------------------------------------------------- |
| Front end | React 18 (Vite) · React Router · Framer Motion · handwritten CSS |
| Back end  | Node.js · Express · JWT auth · Multer uploads · Zod validation   |
| Database  | PostgreSQL                                                       |

---

## Brand palette

Sampled from the logo artwork so the site and the printed identity match:

| Token        | Hex       | Where it comes from / how it is used            |
| ------------ | --------- | ----------------------------------------------- |
| Maroon       | `#7D1416` | The "SHREE" red and the wall-unit blocks        |
| Maroon dark  | `#5A0E10` | The deeper cabinet blocks; dark bands           |
| Maroon soft  | `#A3302F` | Lifted red for hovers, stars                    |
| Navy         | `#16165F` | The counter line — accents on light surfaces    |
| Grey         | `#8C8C8C` | The mid-grey blocks; rules, step numerals       |
| Grey light   | `#B5B5B5` | The pale drawer bank                            |
| Charcoal     | `#2B2B2B` | The "TANU / DESIGNS" text; body copy            |
| Stone        | `#DCD5CF` | Accents on dark grounds, where navy would vanish |

The logo has **no gold**, so the navy counter line carries accents on light
surfaces and a warm stone carries them on dark ones.

The mark itself is redrawn as vector art in `client/src/components/Logo.jsx` —
an abstract kitchen elevation (larder panel, wall units, counter line, drawer
bank) that stays sharp at any size and recolours with the palette. Upload a
raster logo in **Settings → Brand** to override it.

Headings use **Unna** (serif); the wordmark and body use **DM Sans**, with the
wordmark set bold and condensed to match the printed logo. Every colour is
editable in **Admin → Settings → Brand & Colours**, which writes straight into
the CSS custom properties.

---

## Quick start

### 1. Database

**Option A — a real PostgreSQL server (recommended for production)**

Install PostgreSQL 14+, then put your credentials in `server/.env`.

**Option B — zero-install dev database**

The project ships with [PGlite](https://pglite.dev) (real PostgreSQL compiled
to WASM) so you can run everything with no database installed:

```bash
cd server && npm run db:dev
```

Leave that terminal open. It listens on `127.0.0.1:5432` and persists to
`server/.pgdata`. When using it, set `PG_POOL_MAX=1` in `server/.env` — PGlite
serves one connection at a time.

Two caveats with this dev database: stop the API with Ctrl-C (not a hard kill)
so it disconnects cleanly, and run `npm run db:seed` while the API is stopped,
since the single connection can only be held by one process. If a connection is
ever dropped abruptly the socket wedges — restart `npm run db:dev` and carry on.
A real PostgreSQL server has neither limitation.

### 2. Back end

```bash
cd server
npm install
cp .env.example .env
npm run db:reset
npm run dev
```

`db:reset` creates the schema and seeds the whole website — 12 projects,
6 services, 6 kitchen layouts, 8 materials, 6 testimonials, the team, the
process steps, FAQs, page copy and the admin user.

API runs on **http://localhost:5050**.

### 3. Front end

```bash
cd client
npm install
npm run dev
```

Site runs on **http://localhost:5173** and proxies `/api` to the back end.

### 4. Sign in to the admin panel

http://localhost:5173/admin

```
admin@tanushreedesigns.in
Admin@12345
```

Change this immediately under **Settings → Account**.

---

## Public pages

| Route              | What it contains                                                             |
| ------------------ | ---------------------------------------------------------------------------- |
| `/`                | Hero slider, trust strip, intro, services, stats counters, featured projects, process, story, testimonials, CTA, contact form |
| `/about-us`        | Story, stats, principles, process, team, testimonials                        |
| `/modular-kitchen` | Six kitchen layouts, build detail rows, filterable materials, Elica appliances, recent kitchens, FAQs |
| `/our-work`        | Filterable + searchable project gallery                                      |
| `/our-work/:slug`  | Project gallery with lightbox, spec table, related projects                  |
| `/contact-us`      | Contact cards, validated form, Google Map, FAQs                              |
| `/kitchen-price-calculator` | Four-step estimate wizard: layout → wall measurements → package + add-ons → contact details and the figure |

Plus a styled 404, sticky header with mobile drawer, floating call/WhatsApp/
back-to-top buttons, and scroll-reveal animation throughout that respects
`prefers-reduced-motion`.

---

## Admin panel

Everything the website renders is editable — nothing is hard-coded in the React
components.

**Content** — Projects (with gallery + featured toggle), Services, Kitchen
Layouts, Materials, Categories, Testimonials, Team, Process Steps, Stats, FAQs.

A testimonial can be pointed at the project it is about (**Testimonials →
Project this review is about**). The website then shows that room's photograph
beside the quote, with a link through to the project — so a review is backed by
the work it describes rather than sitting on its own.

**Calculator** — Packages & Rates, Layouts, Add-ons, and Estimates (the same
`new → contacted → quoted → won → closed` pipeline as Enquiries, showing the
answers the visitor gave and the figure they were shown).

> **Every rate ships at ₹0 on purpose.** The studio does not publish a rate
> card, and inventing numbers would put false prices in front of customers.
> Until you set them in **Admin → Calculator → Packages & Rates**, the
> calculator still collects the enquiry but shows *"we will call you with a
> figure"* instead of a price. Set the rates before you promote the page.

**Site** — Page Content (hero copy, section headings and SEO per page), Media
Library (drag-and-drop upload, folders, copy URL), Enquiries (status pipeline
`new → contacted → quoted → won → closed`, internal notes), Settings (brand
colours, logo, contact details, social links, announcement bar, hero slides,
trust strip, SEO defaults, account).

Common behaviour across every content screen: search, show/hide without
deleting, display ordering, image picker (upload / media library / paste URL),
delete confirmation, and toast feedback.

---

## API

Public: `GET /api/settings · /api/pages/:slug · /api/services · /api/projects ·
/api/projects/:slug · /api/categories · /api/kitchen-layouts · /api/materials ·
/api/testimonials · /api/team · /api/process · /api/stats · /api/faqs ·
/api/calculator`, and `POST /api/enquiries · POST /api/calculator/quote`.

The estimate itself is worked out on the server from rates held in the
database — never in the browser — and each wall measurement is clamped to the
range its layout allows, so a crafted request cannot produce an invented
figure. Add-on prices are read from the database, not from the request.

Admin (Bearer token): `POST /api/auth/login`, `GET /api/dashboard`, plus
`GET /admin/all`, `POST`, `PUT`, `PATCH :id/toggle`, `POST /reorder` and
`DELETE :id` on every content resource, `/api/media/upload`, `/api/settings`
and `/api/pages/:slug`. The calculator adds `/api/calc-layouts`,
`/api/calc-packages`, `/api/calc-addons` and
`GET/PATCH/DELETE /api/calculator/quotes`.

`GET /api/health` reports database connectivity.

---

## Performance

The public site is built to be light and to cache well.

**One request per page.** Each page used to fire six or seven API calls.
`GET /api/bootstrap/:page` now returns everything a page renders, assembled by
a single batched SQL query, so a page costs one request instead of seven.

**Server-side caching.** Public reads are held in memory (`CACHE_TTL_MS`,
default 60s) and the whole cache is dropped automatically after any admin
write, so edits appear immediately. Responses carry
`stale-while-revalidate`, which lets the browser paint from cache instantly
and refresh in the background. Warm responses serve in ~10ms.

**Code splitting.** Routes are lazy-loaded, so the ~70KB admin panel is no
longer part of the public download. React and Framer Motion sit in their own
long-lived chunks, so a content or styling change does not invalidate them.

**Asset caching.** Vite fingerprints everything in `/assets`, which is served
`immutable, max-age=1y`; `index.html` is `no-cache` so new builds are picked
up immediately. Everything is gzipped (the React chunk goes 164KB → 53KB).

**Responsive images.** `Img` generates a `srcset` for CDN-hosted photography,
so a phone downloads a 400px file where a desktop gets the full-size one. The
hero is included — it is the single largest asset on the site.

**Fonts.** DM Sans is loaded as one variable `400..700` range rather than four
static weights, Unna drops its unused italic, and the stylesheet is attached
as `media="print"` and enabled from `main.jsx` so it never blocks first paint.

A first visit to the home page is roughly **124KB** over the wire, across ~40
requests. Repeat visits serve the shell from cache and make two API calls,
both of which the browser can answer from its own cache while it revalidates.

The largest remaining item is Framer Motion at ~38KB gzipped, about a third of
the JavaScript. Replacing the scroll-reveal animations with an
IntersectionObserver and CSS transitions would remove most of that, at the
cost of a fair amount of rework.

---

## Security

- Passwords hashed with bcrypt; JWT sessions (7-day expiry).
- Rate limiting on sign-in (20 per 15 min) and the contact form (8 per 10 min).
- Zod validation on every write, with field-level errors returned to the UI.
- Honeypot field silently absorbs spam bot submissions.
- Helmet security headers, CORS locked to `CLIENT_ORIGIN`.
- All SQL uses parameterised queries.
- Uploads restricted to images, 8 MB, with sanitised filenames.

---

## Production build

```bash
npm run build                  # builds client/dist
npm start                      # serves API + site from one Node process
```

With `NODE_ENV=production` the API also serves `client/dist`, so a single
process runs the whole site. Both commands are run from the repository root
and resolve their paths from the source files, not the working directory.

---

## Deploying to Render

`render.yaml` is a Blueprint: in Render choose **New + → Blueprint** and point
it at this repository.

**The database is not created by the blueprint.** Render permits only one free
PostgreSQL per account, so the app expects an external one. Any Postgres works
— [Neon](https://neon.tech), Supabase, Aiven, or a Render database you already
have. Create a database, copy its connection string, and paste it when Render
asks for `DATABASE_URL`. Use the provider's **pooled** connection string where
one is offered, and make sure it ends with `?sslmode=require`.

Render will prompt for two values it will not store in git:

- `DATABASE_URL` — the connection string above
- `ADMIN_PASSWORD` — the password for the first admin account

**The first boot sets itself up.** With `RUN_MIGRATIONS=true` the server
applies `schema.sql` on start, and if the database has no admin user yet it
seeds the initial content once. The seed is guarded on that check, so later
restarts and redeploys never overwrite anything edited in the admin panel.
There is no shell step to run, which matters because Render's free plan does
not provide one.

After the first deploy:

1. Open `https://<your-service>.onrender.com/api/health` — expect
   `{"ok":true,"db":"connected"}`.
2. Sign in at `/admin` and change the password under **Settings → Account**.

### Uploads are not persistent on the free plan

This blueprint runs on Render's free plan, which has no disk. Render wipes the
filesystem on every deploy, so **images added through the admin Media Library
do not survive a redeploy.**

The seeded photography is unaffected — it lives in `client/public/images` and
ships with the build. Only files uploaded after deployment are at risk.

Two ways to fix it when you need to:

- **Attach a disk** (paid instance). Add this back to `render.yaml`:
  ```yaml
  disk:
    name: uploads
    mountPath: /opt/render/project/src/server/uploads
    sizeGB: 1
  ```
- **Host images externally** (Cloudinary, S3, Backblaze B2) and paste the URL
  into the image field instead of uploading — every image picker in the admin
  already accepts a URL.

### Free plan cold starts

A free Render service sleeps after inactivity, so the first request after a
quiet period takes ~30 seconds. The paid instance type removes this.

### Custom domain

Add it under **Settings → Custom Domain** in Render and point a CNAME at the
service. `CLIENT_ORIGIN` and `PUBLIC_URL` are wired to Render's external URL
automatically; override them if you serve from a different hostname.

---

## Content & images

Copy and photography come from the live site at tanushreedesigns.in. The logo
is the studio's own artwork (`client/public/logo.png`, with a 2x variant), and
the project photographs are the studio's own, stored in
`client/public/images/` and served from this origin rather than hot-linked.

**The seed deliberately contains no invented facts.** Earlier drafts included
placeholder figures — a project count, years in business, a warranty term, and
client names, locations and dates against each project — none of which the
studio publishes. Those have been removed rather than shipped as claims about
the business. What remains is either taken from the live site or is a neutral
description of what a photograph shows.

That means a few things are intentionally empty:

- **Stats** seeds zero rows, so the counter band does not render. Add real
  figures under **Admin → Stats** and it appears automatically.
- **Projects** have no client, location, year, area or duration. Fill them in
  per project when you want them shown.
- **Testimonials** contains only the two reviews the studio publishes.
- **Team members** have no photographs, so each shows a monogram until one is
  uploaded.

Everything is editable in the admin panel — replace or extend it there rather
than editing the seed, which is only for a fresh install.

### The map

The contact page embeds Google Maps centred on the studio address, with the
address and a **Get Directions** button underneath. The embed is built from
the address string, so the pin is as accurate as Google's geocoding of it. If
the studio has a Google Business Profile, pasting its share URL into
**Admin → Settings → Contact → Google Maps embed URL** will pin the listing
exactly, along with its name, photos and reviews.
