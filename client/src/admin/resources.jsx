/**
 * Every schema-driven admin screen, described once.
 */
import ResourcePage, { cellStatus, cellThumb, cellTruncate } from './ResourcePage.jsx';
import Icon from '../lib/icons.jsx';

const ICON_OPTIONS = [
  'kitchen', 'wardrobe', 'sofa', 'appliance', 'home', 'compass',
  'pencil', 'layers', 'tools', 'check', 'shield', 'award', 'ruler', 'sparkle',
].map((v) => ({ value: v, label: v }));

/* --------------------------------------------------------- services */
export const ServicesPage = () => (
  <ResourcePage
    resource="services"
    title="Services"
    subtitle="The What We Do cards on the home page and the feature rows on the kitchen page"
    singular="Service"
    emptyIcon="kitchen"
    columns={[
      { key: 'title', label: 'Service', render: cellThumb('image_url', 'title', 'short_desc') },
      { key: 'icon', label: 'Icon', width: 110 },
      { key: 'sort_order', label: 'Order', width: 80 },
      { key: 'is_active', label: 'Status', width: 100, render: cellStatus },
    ]}
    fields={[
      { name: 'title', label: 'Title', type: 'text', required: true, half: true },
      { name: 'icon', label: 'Icon', type: 'select', options: ICON_OPTIONS, required: true, half: true },
      { name: 'short_desc', label: 'Short description', type: 'textarea', rows: 2, hint: 'Shown on the home page card' },
      { name: 'description', label: 'Full description', type: 'textarea', rows: 5 },
      { name: 'image_url', label: 'Image', type: 'image' },
      { name: 'highlights', label: 'Highlights', type: 'list', placeholder: 'Add a highlight' },
    ]}
  />
);

/* -------------------------------------------------- kitchen layouts */
export const LayoutsPage = () => (
  <ResourcePage
    resource="kitchen-layouts"
    title="Kitchen Layouts"
    subtitle="The layout cards on the Modular Kitchen page"
    singular="Layout"
    emptyIcon="layout"
    columns={[
      { key: 'title', label: 'Layout', render: cellThumb('image_url', 'title', 'best_for') },
      { key: 'sort_order', label: 'Order', width: 80 },
      { key: 'is_active', label: 'Status', width: 100, render: cellStatus },
    ]}
    fields={[
      { name: 'title', label: 'Layout name', type: 'text', required: true, half: true },
      { name: 'best_for', label: 'Best for', type: 'text', half: true, placeholder: 'Most 2 & 3 BHK kitchens' },
      { name: 'description', label: 'Description', type: 'textarea', rows: 4 },
      { name: 'image_url', label: 'Image', type: 'image' },
      { name: 'features', label: 'Features', type: 'list', placeholder: 'Add a feature' },
    ]}
  />
);

/* -------------------------------------------------------- materials */
export const MaterialsPage = () => (
  <ResourcePage
    resource="materials"
    title="Materials & Finishes"
    subtitle="Shutter finishes, core boards and countertops shown on the kitchen page"
    singular="Material"
    emptyIcon="layers"
    searchKeys={['name', 'category']}
    defaults={{ category: 'finish', swatch_hex: '#CB9C57' }}
    columns={[
      { key: 'name', label: 'Material', render: cellThumb('image_url', 'name', 'description') },
      {
        key: 'category',
        label: 'Category',
        width: 130,
        render: (r) => <span className="chip chip--gold">{r.category}</span>,
      },
      {
        key: 'swatch_hex',
        label: 'Swatch',
        width: 90,
        render: (r) => (
          <span
            style={{
              display: 'inline-block',
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: r.swatch_hex,
              border: '1px solid var(--admin-line)',
            }}
          />
        ),
      },
      { key: 'is_active', label: 'Status', width: 100, render: cellStatus },
    ]}
    fields={[
      { name: 'name', label: 'Name', type: 'text', required: true, half: true },
      {
        name: 'category',
        label: 'Category',
        type: 'select',
        required: true,
        half: true,
        options: [
          { value: 'finish', label: 'Shutter finish' },
          { value: 'core', label: 'Core material' },
          { value: 'countertop', label: 'Countertop' },
          { value: 'hardware', label: 'Hardware' },
        ],
      },
      { name: 'description', label: 'Description', type: 'textarea', rows: 3 },
      { name: 'swatch_hex', label: 'Swatch colour', type: 'color', half: true },
      { name: 'image_url', label: 'Image', type: 'image' },
    ]}
  />
);

/* ------------------------------------------------------- categories */
export const CategoriesPage = () => (
  <ResourcePage
    resource="categories"
    title="Project Categories"
    subtitle="The filter chips on the Our Work page"
    singular="Category"
    emptyIcon="tag"
    searchKeys={['name']}
    columns={[
      { key: 'name', label: 'Category', render: (r) => <b style={{ fontWeight: 500 }}>{r.name}</b> },
      { key: 'slug', label: 'URL slug', render: (r) => <code style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{r.slug}</code> },
      { key: 'sort_order', label: 'Order', width: 80 },
      { key: 'is_active', label: 'Status', width: 100, render: cellStatus },
    ]}
    fields={[
      { name: 'name', label: 'Category name', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea', rows: 2 },
    ]}
  />
);

/* ----------------------------------------------------- testimonials */
export const TestimonialsPage = () => (
  <ResourcePage
    resource="testimonials"
    title="Testimonials"
    subtitle="Client reviews shown in the slider on the home and about pages"
    singular="Testimonial"
    emptyIcon="quote"
    searchKeys={['name', 'location', 'message']}
    defaults={{ rating: 5 }}
    columns={[
      { key: 'name', label: 'Client', render: cellThumb('avatar_url', 'name', 'location') },
      {
        key: 'rating',
        label: 'Rating',
        width: 120,
        render: (r) => (
          <span style={{ display: 'inline-flex', gap: 2, color: 'var(--gold)' }}>
            {Array.from({ length: r.rating }).map((_, i) => (
              <Icon.star key={i} style={{ width: 13, height: 13 }} />
            ))}
          </span>
        ),
      },
      { key: 'message', label: 'Review', render: cellTruncate('message', 48) },
      {
        key: 'project_id',
        label: 'Project',
        width: 110,
        render: (r) =>
          r.project_id ? (
            <span className="chip chip--live">linked</span>
          ) : (
            <span className="chip chip--off">none</span>
          ),
      },
      { key: 'is_active', label: 'Status', width: 100, render: cellStatus },
    ]}
    fields={[
      { name: 'name', label: 'Client name', type: 'text', required: true, half: true },
      { name: 'location', label: 'Location', type: 'text', half: true, placeholder: 'Bopal, Ahmedabad' },
      {
        name: 'rating',
        label: 'Rating',
        type: 'select',
        half: true,
        required: true,
        options: [5, 4, 3, 2, 1].map((n) => ({ value: n, label: `${n} star${n > 1 ? 's' : ''}` })),
      },
      { name: 'role', label: 'Role / project', type: 'text', half: true, placeholder: 'Modular kitchen, 2025' },
      { name: 'message', label: 'Review text', type: 'textarea', rows: 6, required: true },
      { name: 'avatar_url', label: 'Photo', type: 'image' },
      {
        name: 'project_id',
        label: 'Project this review is about',
        type: 'select',
        optionsFrom: 'projects',
        optionLabel: (p) => `${p.title}${p.location ? ` — ${p.location}` : ''}`,
        hint: 'Shown beside the quote on the website, with a link through to it',
      },
    ]}
  />
);

/* ------------------------------------------------------------- team */
export const TeamPage = () => (
  <ResourcePage
    resource="team"
    title="Team"
    subtitle="The people shown on the About page"
    singular="Team member"
    emptyIcon="users"
    searchKeys={['name', 'role']}
    columns={[
      { key: 'name', label: 'Member', render: cellThumb('photo_url', 'name', 'role') },
      { key: 'bio', label: 'Bio', render: cellTruncate('bio', 62) },
      { key: 'is_active', label: 'Status', width: 100, render: cellStatus },
    ]}
    fields={[
      { name: 'name', label: 'Full name', type: 'text', required: true, half: true },
      { name: 'role', label: 'Role', type: 'text', half: true, placeholder: 'Senior Interior Designer' },
      { name: 'bio', label: 'Short bio', type: 'textarea', rows: 3 },
      { name: 'photo_url', label: 'Photo', type: 'image' },
    ]}
  />
);

/* ---------------------------------------------------------- process */
export const ProcessPage = () => (
  <ResourcePage
    resource="process"
    title="Process Steps"
    subtitle="The How We Work timeline on the home and about pages"
    singular="Step"
    emptyIcon="compass"
    searchKeys={['title']}
    defaults={{ icon: 'compass', step_no: 1 }}
    columns={[
      { key: 'step_no', label: '#', width: 60 },
      { key: 'title', label: 'Step', render: (r) => <b style={{ fontWeight: 500 }}>{r.title}</b> },
      { key: 'description', label: 'Description', render: cellTruncate('description', 70) },
      { key: 'is_active', label: 'Status', width: 100, render: cellStatus },
    ]}
    fields={[
      { name: 'step_no', label: 'Step number', type: 'number', required: true, half: true, min: 1 },
      { name: 'icon', label: 'Icon', type: 'select', options: ICON_OPTIONS, half: true },
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea', rows: 3 },
    ]}
  />
);

/* ------------------------------------------------------------ stats */
export const StatsPage = () => (
  <ResourcePage
    resource="stats"
    title="Stats"
    subtitle="The counter band shown on the home and about pages"
    singular="Stat"
    emptyIcon="award"
    searchKeys={['label']}
    defaults={{ suffix: '+' }}
    columns={[
      {
        key: 'value',
        label: 'Value',
        width: 120,
        render: (r) => (
          <b style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem' }}>
            {r.value}
            {r.suffix}
          </b>
        ),
      },
      { key: 'label', label: 'Label' },
      { key: 'is_active', label: 'Status', width: 100, render: cellStatus },
    ]}
    fields={[
      { name: 'value', label: 'Number', type: 'number', required: true, half: true },
      { name: 'suffix', label: 'Suffix', type: 'text', half: true, placeholder: '+ / yr / %' },
      { name: 'label', label: 'Label', type: 'text', required: true },
    ]}
  />
);

/* ------------------------------------------------------------- faqs */
export const FaqsPage = () => (
  <ResourcePage
    resource="faqs"
    title="FAQs"
    subtitle="Questions shown on the Modular Kitchen and Contact pages"
    singular="FAQ"
    emptyIcon="file"
    searchKeys={['question', 'answer', 'category']}
    defaults={{ category: 'general' }}
    columns={[
      { key: 'question', label: 'Question', render: (r) => <b style={{ fontWeight: 500 }}>{r.question}</b> },
      {
        key: 'category',
        label: 'Category',
        width: 130,
        render: (r) => <span className="chip chip--gold">{r.category}</span>,
      },
      { key: 'is_active', label: 'Status', width: 100, render: cellStatus },
    ]}
    fields={[
      { name: 'question', label: 'Question', type: 'text', required: true },
      { name: 'answer', label: 'Answer', type: 'textarea', rows: 5, required: true },
      {
        name: 'category',
        label: 'Category',
        type: 'select',
        half: true,
        options: ['general', 'kitchen', 'materials', 'warranty', 'appliances', 'process'].map((v) => ({
          value: v,
          label: v,
        })),
      },
    ]}
  />
);

/* ======================================================= calculator ==== */

export const CalcLayoutsPage = () => (
  <ResourcePage
    resource="calc-layouts"
    title="Calculator — Layouts"
    subtitle="Step 1 of the price calculator: the kitchen shapes a visitor can pick"
    singular="Layout"
    emptyIcon="layout"
    columns={[
      { key: 'title', label: 'Layout', render: cellThumb('image_url', 'title', 'description') },
      {
        key: 'segments',
        label: 'Walls measured',
        width: 150,
        render: (r) =>
          Array.isArray(r.segments) && r.segments.length
            ? r.segments.map((x) => x.label).join(', ')
            : '—',
      },
      { key: 'sort_order', label: 'Order', width: 80 },
      { key: 'is_active', label: 'Status', width: 100, render: cellStatus },
    ]}
    fields={[
      { name: 'title', label: 'Layout name', type: 'text', required: true },
      { name: 'description', label: 'Short description', type: 'textarea', rows: 2 },
      { name: 'image_url', label: 'Plan diagram', type: 'image', hint: 'A simple top-down drawing of the shape' },
      {
        name: 'segments',
        label: 'Wall segments (structured)',
        type: 'json',
        hint: 'One entry per wall to measure: label, min, max and default, all in feet',
      },
    ]}
  />
);

export const CalcPackagesPage = () => (
  <ResourcePage
    resource="calc-packages"
    title="Calculator — Packages"
    subtitle="Step 3: the tiers a visitor picks, and the rate each one is priced at"
    singular="Package"
    emptyIcon="layers"
    columns={[
      { key: 'title', label: 'Package', render: cellThumb('image_url', 'title', 'description') },
      {
        key: 'rate_per_ft',
        label: 'Rate / running ft',
        width: 165,
        render: (r) =>
          Number(r.rate_per_ft) > 0 ? (
            <b style={{ fontWeight: 600 }}>
              ₹{Number(r.rate_per_ft).toLocaleString('en-IN')}
            </b>
          ) : (
            <span className="chip chip--new">not priced</span>
          ),
      },
      { key: 'tier', label: 'Tier', width: 80, render: (r) => '₹'.repeat(r.tier || 1) },
      { key: 'is_active', label: 'Status', width: 100, render: cellStatus },
    ]}
    fields={[
      { name: 'title', label: 'Package name', type: 'text', required: true, half: true },
      {
        name: 'tier',
        label: 'Price tier (₹ symbols shown)',
        type: 'select',
        half: true,
        options: [2, 3, 4, 5].map((n) => ({ value: n, label: '₹'.repeat(n) })),
      },
      {
        name: 'rate_per_ft',
        label: 'Rate per running foot (₹)',
        type: 'number',
        hint: 'Leave at 0 and the calculator collects the enquiry without showing a figure',
      },
      { name: 'description', label: 'Description', type: 'textarea', rows: 3 },
      { name: 'image_url', label: 'Image', type: 'image' },
      { name: 'features', label: 'What is included', type: 'list', placeholder: 'Add a feature' },
    ]}
  />
);

export const CalcAddonsPage = () => (
  <ResourcePage
    resource="calc-addons"
    title="Calculator — Add-ons"
    subtitle="Optional extras such as the Elica chimney, hob, oven and sink"
    singular="Add-on"
    emptyIcon="appliance"
    searchKeys={['title', 'category']}
    defaults={{ category: 'appliance' }}
    columns={[
      { key: 'title', label: 'Add-on', render: cellThumb('image_url', 'title', 'description') },
      {
        key: 'price',
        label: 'Price',
        width: 140,
        render: (r) =>
          Number(r.price) > 0 ? (
            <b style={{ fontWeight: 600 }}>₹{Number(r.price).toLocaleString('en-IN')}</b>
          ) : (
            <span className="chip chip--new">not priced</span>
          ),
      },
      {
        key: 'category',
        label: 'Category',
        width: 120,
        render: (r) => <span className="chip chip--gold">{r.category}</span>,
      },
      { key: 'is_active', label: 'Status', width: 100, render: cellStatus },
    ]}
    fields={[
      { name: 'title', label: 'Add-on name', type: 'text', required: true, half: true },
      {
        name: 'category',
        label: 'Category',
        type: 'select',
        half: true,
        options: ['appliance', 'fitting', 'storage', 'lighting', 'other'].map((v) => ({
          value: v,
          label: v,
        })),
      },
      { name: 'price', label: 'Price (₹)', type: 'number', hint: 'Added on top of the cabinetry estimate' },
      { name: 'description', label: 'Description', type: 'textarea', rows: 2 },
      { name: 'image_url', label: 'Image', type: 'image' },
    ]}
  />
);
