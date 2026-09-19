-- =====================================================================
--  Tanushree Designs - PostgreSQL schema
--  Every piece of front-end content lives here so the admin panel can
--  edit the entire website without touching code.
-- =====================================================================


-- ---------------------------------------------------------------- users
CREATE TABLE IF NOT EXISTS admin_users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(160) NOT NULL UNIQUE,
  password_hash TEXT         NOT NULL,
  role          VARCHAR(20)  NOT NULL DEFAULT 'admin',
  avatar_url    TEXT,
  last_login_at TIMESTAMPTZ,
  is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------- site settings
-- key/value JSONB so new editable blocks need no migration.
CREATE TABLE IF NOT EXISTS site_settings (
  key         VARCHAR(80) PRIMARY KEY,
  value       JSONB       NOT NULL DEFAULT '{}'::jsonb,
  label       VARCHAR(160),
  group_name  VARCHAR(60) NOT NULL DEFAULT 'general',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------- media lib
CREATE TABLE IF NOT EXISTS media (
  id         SERIAL PRIMARY KEY,
  filename   VARCHAR(255) NOT NULL,
  url        TEXT         NOT NULL,
  mime_type  VARCHAR(100),
  size_bytes BIGINT,
  alt_text   VARCHAR(255),
  folder     VARCHAR(60)  NOT NULL DEFAULT 'general',
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------- categories
CREATE TABLE IF NOT EXISTS categories (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(120) NOT NULL,
  slug        VARCHAR(140) NOT NULL UNIQUE,
  description TEXT,
  sort_order  INTEGER      NOT NULL DEFAULT 0,
  is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------- services
CREATE TABLE IF NOT EXISTS services (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(160) NOT NULL,
  slug        VARCHAR(180) NOT NULL UNIQUE,
  short_desc  VARCHAR(400),
  description TEXT,
  icon        VARCHAR(60)  NOT NULL DEFAULT 'kitchen',
  image_url   TEXT,
  highlights  JSONB        NOT NULL DEFAULT '[]'::jsonb,
  sort_order  INTEGER      NOT NULL DEFAULT 0,
  is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------- projects
CREATE TABLE IF NOT EXISTS projects (
  id           SERIAL PRIMARY KEY,
  title        VARCHAR(180) NOT NULL,
  slug         VARCHAR(200) NOT NULL UNIQUE,
  category_id  INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  client_name  VARCHAR(160),
  location     VARCHAR(160),
  year         INTEGER,
  area_sqft    VARCHAR(60),
  duration     VARCHAR(60),
  summary      VARCHAR(500),
  description  TEXT,
  cover_image  TEXT,
  tags         JSONB        NOT NULL DEFAULT '[]'::jsonb,
  is_featured  BOOLEAN      NOT NULL DEFAULT FALSE,
  is_active    BOOLEAN      NOT NULL DEFAULT TRUE,
  sort_order   INTEGER      NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category_id);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(is_featured);

CREATE TABLE IF NOT EXISTS project_images (
  id         SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  image_url  TEXT    NOT NULL,
  caption    VARCHAR(255),
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_project_images_project ON project_images(project_id);

-- ------------------------------------------------------ kitchen layouts
CREATE TABLE IF NOT EXISTS kitchen_layouts (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(160) NOT NULL,
  slug        VARCHAR(180) NOT NULL UNIQUE,
  description TEXT,
  image_url   TEXT,
  best_for    VARCHAR(255),
  features    JSONB        NOT NULL DEFAULT '[]'::jsonb,
  sort_order  INTEGER      NOT NULL DEFAULT 0,
  is_active   BOOLEAN      NOT NULL DEFAULT TRUE
);

-- ------------------------------------------------------------ materials
CREATE TABLE IF NOT EXISTS materials (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(160) NOT NULL,
  category    VARCHAR(80)  NOT NULL DEFAULT 'finish',
  description TEXT,
  image_url   TEXT,
  swatch_hex  VARCHAR(9),
  sort_order  INTEGER      NOT NULL DEFAULT 0,
  is_active   BOOLEAN      NOT NULL DEFAULT TRUE
);

-- --------------------------------------------------------- testimonials
CREATE TABLE IF NOT EXISTS testimonials (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(140) NOT NULL,
  location   VARCHAR(160),
  role       VARCHAR(120),
  rating     SMALLINT     NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  message    TEXT         NOT NULL,
  avatar_url TEXT,
  project_id INTEGER,
  is_active  BOOLEAN      NOT NULL DEFAULT TRUE,
  sort_order INTEGER      NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- A review is far more persuasive next to the room it is about, so a
-- testimonial can point at the project it came from. Added separately so
-- existing installations pick it up on the next migrate.
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS project_id INTEGER;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'testimonials_project_id_fkey'
  ) THEN
    ALTER TABLE testimonials
      ADD CONSTRAINT testimonials_project_id_fkey
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ----------------------------------------------------------------- team
CREATE TABLE IF NOT EXISTS team_members (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(140) NOT NULL,
  role       VARCHAR(140),
  bio        TEXT,
  photo_url  TEXT,
  socials    JSONB        NOT NULL DEFAULT '{}'::jsonb,
  sort_order INTEGER      NOT NULL DEFAULT 0,
  is_active  BOOLEAN      NOT NULL DEFAULT TRUE
);

-- -------------------------------------------------------- process steps
CREATE TABLE IF NOT EXISTS process_steps (
  id          SERIAL PRIMARY KEY,
  step_no     INTEGER      NOT NULL,
  title       VARCHAR(160) NOT NULL,
  description TEXT,
  icon        VARCHAR(60)  NOT NULL DEFAULT 'compass',
  is_active   BOOLEAN      NOT NULL DEFAULT TRUE
);

-- ---------------------------------------------------------------- stats
CREATE TABLE IF NOT EXISTS stats (
  id         SERIAL PRIMARY KEY,
  label      VARCHAR(120) NOT NULL,
  value      INTEGER      NOT NULL DEFAULT 0,
  suffix     VARCHAR(10)  NOT NULL DEFAULT '+',
  sort_order INTEGER      NOT NULL DEFAULT 0,
  is_active  BOOLEAN      NOT NULL DEFAULT TRUE
);

-- ----------------------------------------------------------------- faqs
CREATE TABLE IF NOT EXISTS faqs (
  id         SERIAL PRIMARY KEY,
  question   VARCHAR(300) NOT NULL,
  answer     TEXT         NOT NULL,
  category   VARCHAR(80)  NOT NULL DEFAULT 'general',
  sort_order INTEGER      NOT NULL DEFAULT 0,
  is_active  BOOLEAN      NOT NULL DEFAULT TRUE
);

-- ------------------------------------------------------------ enquiries
CREATE TABLE IF NOT EXISTS enquiries (
  id          SERIAL PRIMARY KEY,
  first_name  VARCHAR(120) NOT NULL,
  last_name   VARCHAR(120),
  email       VARCHAR(180) NOT NULL,
  phone       VARCHAR(40),
  subject     VARCHAR(200),
  message     TEXT         NOT NULL,
  source_page VARCHAR(120) NOT NULL DEFAULT 'contact',
  status      VARCHAR(20)  NOT NULL DEFAULT 'new',
  admin_note  TEXT,
  ip_address  VARCHAR(60),
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries(status);
CREATE INDEX IF NOT EXISTS idx_enquiries_created ON enquiries(created_at DESC);

-- ------------------------------------------------------------ page copy
-- Hero text, section headings etc. for every public page.
CREATE TABLE IF NOT EXISTS pages (
  id              SERIAL PRIMARY KEY,
  slug            VARCHAR(120) NOT NULL UNIQUE,
  title           VARCHAR(200) NOT NULL,
  hero_title      VARCHAR(300),
  hero_subtitle   TEXT,
  hero_image      TEXT,
  sections        JSONB        NOT NULL DEFAULT '{}'::jsonb,
  seo_title       VARCHAR(200),
  seo_description VARCHAR(400),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- =====================================================================
--  Kitchen price calculator
--  Every rate, label, image and option is editable in the admin panel —
--  nothing about pricing is hard-coded in the front end.
-- =====================================================================

-- Step 1: the layouts a visitor can choose, each with its own plan diagram
-- and the wall segments that get measured in step 2.
CREATE TABLE IF NOT EXISTS calc_layouts (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(120) NOT NULL,
  slug        VARCHAR(140) NOT NULL UNIQUE,
  description TEXT,
  image_url   TEXT,
  -- [{ "label": "A", "min": 4, "max": 20, "default": 8 }, ...]
  segments    JSONB        NOT NULL DEFAULT '[]'::jsonb,
  sort_order  INTEGER      NOT NULL DEFAULT 0,
  is_active   BOOLEAN      NOT NULL DEFAULT TRUE
);

-- Step 3: package tiers. rate_per_ft is the price of one running foot of
-- base + wall cabinetry in that tier.
CREATE TABLE IF NOT EXISTS calc_packages (
  id           SERIAL PRIMARY KEY,
  title        VARCHAR(120) NOT NULL,
  slug         VARCHAR(140) NOT NULL UNIQUE,
  tier         SMALLINT     NOT NULL DEFAULT 2,
  description  TEXT,
  image_url    TEXT,
  features     JSONB        NOT NULL DEFAULT '[]'::jsonb,
  rate_per_ft  INTEGER      NOT NULL DEFAULT 0,
  sort_order   INTEGER      NOT NULL DEFAULT 0,
  is_active    BOOLEAN      NOT NULL DEFAULT TRUE
);

-- Optional extras priced as a flat amount each (chimney, hob, sink...).
CREATE TABLE IF NOT EXISTS calc_addons (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(140) NOT NULL,
  slug        VARCHAR(160) NOT NULL UNIQUE,
  description TEXT,
  image_url   TEXT,
  price       INTEGER      NOT NULL DEFAULT 0,
  category    VARCHAR(60)  NOT NULL DEFAULT 'appliance',
  sort_order  INTEGER      NOT NULL DEFAULT 0,
  is_active   BOOLEAN      NOT NULL DEFAULT TRUE
);

-- Every estimate a visitor completes, with the answers that produced it.
CREATE TABLE IF NOT EXISTS calc_quotes (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(140) NOT NULL,
  email        VARCHAR(180) NOT NULL,
  phone        VARCHAR(40),
  city         VARCHAR(120),
  whatsapp_ok  BOOLEAN      NOT NULL DEFAULT FALSE,
  layout_id    INTEGER REFERENCES calc_layouts(id) ON DELETE SET NULL,
  package_id   INTEGER REFERENCES calc_packages(id) ON DELETE SET NULL,
  running_feet NUMERIC(6,2) NOT NULL DEFAULT 0,
  addon_ids    JSONB        NOT NULL DEFAULT '[]'::jsonb,
  estimate_low INTEGER      NOT NULL DEFAULT 0,
  estimate_high INTEGER     NOT NULL DEFAULT 0,
  breakdown    JSONB        NOT NULL DEFAULT '{}'::jsonb,
  status       VARCHAR(20)  NOT NULL DEFAULT 'new',
  admin_note   TEXT,
  ip_address   VARCHAR(60),
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_calc_quotes_created ON calc_quotes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_calc_quotes_status ON calc_quotes(status);
