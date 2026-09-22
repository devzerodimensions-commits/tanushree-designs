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

/* --------------------------------------------------- chimney types */
export const ChimneyTypesPage = () => (
  <ResourcePage
    resource="chimney-types"
    title="Chimney Types"
    subtitle="The cards on the Elica Chimney page"
    singular="Chimney type"
    emptyIcon="appliance"
    columns={[
      { key: 'title', label: 'Chimney type', render: cellThumb('image_url', 'title', 'best_for') },
      { key: 'sort_order', label: 'Order', width: 80 },
      { key: 'is_active', label: 'Status', width: 100, render: cellStatus },
    ]}
    fields={[
      { name: 'title', label: 'Type name', type: 'text', required: true, half: true },
      { name: 'best_for', label: 'Best for', type: 'text', half: true, placeholder: 'Straight and L-shaped kitchens' },
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
          // Every row seeded so far is a 'promise' — the "what you get" list
          // on the kitchen page. Without it here, opening one of those rows
          // showed a category it could not represent, and saving would have
          // quietly filed it as a shutter finish.
          { value: 'promise', label: 'What you get (promise)' },
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

/**
 * Said plainly on the screen where it can be fixed.
 *
 * With every rate at zero the calculator has no figure to show, so it falls
 * back to taking the enquiry — which from the outside looks like a broken
 * page rather than a deliberate choice. The banner names the cause, and
 * disappears the moment one package is priced.
 */
const unpricedNotice = (rows) => {
  const priced = rows.filter((r) => Number(r.rate_per_ft) > 0);
  if (priced.length) return null;

  return (
    <div className="a-notice">
      <b>No package has a price yet, so the calculator is not showing a figure.</b>
      <span>
        It asks the visitor for their details and says your team will be in touch. To show an
        estimate instead, open a package below, set its rate per running foot, and press
        Save — the front of the site changes the moment you do.
      </span>
    </div>
  );
};

export const CalcPackagesPage = () => (
  <ResourcePage
    resource="calc-packages"
    notice={unpricedNotice}
    title="Calculator — Packages"
    subtitle="Step 3: the tiers a visitor picks, and the rate each one is priced at"
    singular="Package"
    emptyIcon="layers"
    columns={[
      { key: 'title', label: 'Package', render: cellThumb('image_url', 'title', 'description') },
      {
        key: 'rate_per_ft',
        label: 'Rate / running ft',
        width: 180,
        render: (r) => {
          const total = Number(r.rate_per_ft) || 0;
          if (!total) return <span className="chip chip--new">not priced</span>;
          return (
            <b style={{ fontWeight: 600 }}>
              ₹{total.toLocaleString('en-IN')}
            </b>
          );
        },
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
        label: 'Package rate per running foot (₹)',
        type: 'number',
        hint: 'Package pricing is separate from product usage quantities.',
      },
      { name: 'description', label: 'Description', type: 'textarea', rows: 3 },
      { name: 'image_url', label: 'Image', type: 'image' },
      {
        name: 'features',
        label: 'What is included',
        type: 'included',
        hint: 'Enter each product’s price and usage percentage (0–100). These are independent values; the package rate is set separately.',
      },
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

/* ================================================ build your own ==== */

const UNIT_OPTIONS = [
  { value: 'per_ft', label: 'Per running foot of kitchen' },
  { value: 'per_sqft', label: 'Per square foot of shutter area' },
  { value: 'flat', label: 'One flat price, whatever the size' },
];

const UNIT_SHORT = { per_ft: '/ running ft', per_sqft: '/ sq ft', flat: 'flat' };

export const CalcGroupsPage = () => (
  <ResourcePage
    resource="calc-groups"
    title="Build Your Own — Questions"
    subtitle="The questions asked when a visitor chooses to specify the kitchen themselves"
    singular="Question"
    emptyIcon="compass"
    searchKeys={['question', 'key']}
    defaults={{ mode: 'single' }}
    columns={[
      { key: 'question', label: 'Question', render: cellTruncate('question', 60) },
      {
        key: 'mode',
        label: 'How they answer',
        width: 150,
        render: (r) => (
          <span className="chip chip--gold">
            {{ single: 'Pick one', multi: 'Pick any', yesno: 'Yes / No' }[r.mode] ?? r.mode}
          </span>
        ),
      },
      { key: 'key', label: 'Reference', width: 120 },
      { key: 'sort_order', label: 'Order', width: 80 },
      { key: 'is_active', label: 'Status', width: 100, render: cellStatus },
    ]}
    fields={[
      { name: 'question', label: 'The question', type: 'text', required: true },
      {
        name: 'help_text',
        label: 'Helper line',
        type: 'textarea',
        rows: 2,
        hint: 'Shown under the question to explain what is being asked',
      },
      {
        name: 'mode',
        label: 'How they answer',
        type: 'select',
        half: true,
        options: [
          { value: 'single', label: 'Pick one' },
          { value: 'multi', label: 'Pick any number' },
          { value: 'yesno', label: 'Yes / No' },
        ],
      },
      {
        name: 'key',
        label: 'Reference',
        type: 'text',
        half: true,
        required: true,
        hint: 'Short lowercase name used to attach answers. Do not change it once answers exist.',
      },
    ]}
  />
);

export const CalcOptionsPage = () => (
  <ResourcePage
    resource="calc-options"
    title="Build Your Own — Answers"
    subtitle="Every answer a visitor can pick, what it costs, and how that cost is measured"
    singular="Answer"
    emptyIcon="layers"
    searchKeys={['title', 'group_key']}
    defaults={{ unit: 'per_ft', tier: 2 }}
    columns={[
      { key: 'title', label: 'Answer', render: cellThumb('image_url', 'title', 'description') },
      {
        key: 'group_key',
        label: 'Question',
        width: 130,
        render: (r) => <span className="chip chip--gold">{r.group_key}</span>,
      },
      {
        key: 'rate',
        label: 'Price',
        width: 175,
        render: (r) =>
          Number(r.rate) > 0 ? (
            <b style={{ fontWeight: 600 }}>
              ₹{Number(r.rate).toLocaleString('en-IN')}{' '}
              <span style={{ fontWeight: 400, color: 'var(--muted)', fontSize: '0.78rem' }}>
                {UNIT_SHORT[r.unit] ?? r.unit}
              </span>
            </b>
          ) : (
            <span className="chip chip--new">not priced</span>
          ),
      },
      { key: 'tier', label: 'Shown as', width: 90, render: (r) => '₹'.repeat(r.tier || 1) },
      { key: 'is_active', label: 'Status', width: 100, render: cellStatus },
    ]}
    fields={[
      { name: 'title', label: 'Answer', type: 'text', required: true, half: true },
      {
        name: 'group_key',
        label: 'Belongs to question',
        type: 'text',
        half: true,
        required: true,
        hint: 'The reference of the question, e.g. core, finish, appliances',
      },
      { name: 'description', label: 'Description', type: 'textarea', rows: 2 },
      {
        name: 'pro_tip',
        label: 'Pro tip',
        type: 'textarea',
        rows: 2,
        hint: 'A line of advice shown under the description',
      },
      {
        name: 'rate',
        label: 'Price (₹)',
        type: 'number',
        half: true,
        hint: 'Leave at 0 and this answer adds nothing to the estimate',
      },
      {
        name: 'unit',
        label: 'How the price is measured',
        type: 'select',
        half: true,
        options: UNIT_OPTIONS,
      },
      {
        name: 'tier',
        label: 'Rupee symbols shown',
        type: 'select',
        half: true,
        options: [1, 2, 3, 4].map((n) => ({ value: n, label: '₹'.repeat(n) })),
        hint: 'Only a signal of relative cost. Nothing is calculated from it.',
      },
      { name: 'image_url', label: 'Image', type: 'image' },
    ]}
  />
);
