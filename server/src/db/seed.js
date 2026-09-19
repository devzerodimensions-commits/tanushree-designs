/**
 * Seeds the database with the Tanushree Designs website content.
 *
 * Copy and photography are taken from the live site at tanushreedesigns.in.
 * Nothing here invents facts about the business — no client names, project
 * locations, delivery counts or warranty claims beyond what the studio
 * publishes itself. Anything else goes in through the admin panel.
 *
 *   npm run db:seed
 */
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { pool } from './pool.js';

dotenv.config();

/** The studio's own photography, copied into client/public/images. */
const P = {
  hero: '/images/hero-img.webp',
  kitchen: '/images/modular-kitchen.webp',
  kitchen2: '/images/modular-kitchen-2.webp',
  kitchen3: '/images/modular-kitchen-3.webp',
  kitchen7: '/images/modular-kitchen-7.webp',
  kitchen8: '/images/modular-kitchen-8.webp',
  kitchen9: '/images/modular-kitchen-9.webp',
  kitchenAlt: '/images/modular-kicthen.webp',
  classic: '/images/classic-kitchen.webp',
  classic2: '/images/classic-kitchen-2.webp',
  work1: '/images/our-work-modular-kitchen.webp',
  work2: '/images/our-work-modular-kitchen-2.webp',
  work3: '/images/our-work-modular-kitchen-3.webp',
  signature: '/images/tanushree-modular-kitchen.webp',
  wardrobe1: '/images/modular-wardrobe-1.webp',
  wardrobe2: '/images/modular-wardrobe-2.webp',
  wardrobe3: '/images/modular-wardrobe-webp.webp',
  appliances: '/images/kitchen-appliances.webp',
  interiors: '/images/interior-design.webp',
};

// ===================================================================
//  Content
// ===================================================================

const CATEGORIES = [
  { name: 'Modular Kitchen', slug: 'modular-kitchen', description: 'Kitchens planned around how the space is actually used.' },
  { name: 'Wardrobes & Storage', slug: 'wardrobes-storage', description: 'Fitted wardrobes and storage built to the room.' },
  { name: 'Interior Spaces', slug: 'interior-spaces', description: 'Complete interiors designed for comfort and style.' },
];

/** The four things the studio lists under What We Do. */
const SERVICES = [
  {
    title: 'Modular Kitchens',
    icon: 'kitchen',
    short_desc:
      'Thoughtfully planned kitchens combining functionality, intelligent storage and elegant aesthetics.',
    description:
      'A well-designed modular kitchen is more than just a cooking space — it is the heart of the home. Our kitchens are thoughtfully planned to combine functionality, intelligent storage and elegant aesthetics, ensuring every corner works seamlessly for your lifestyle.',
    image_url: P.kitchen,
    highlights: ['Premium quality materials', 'Smart storage solutions', 'Customized designs', 'Professional installation'],
  },
  {
    title: 'Modular Wardrobes',
    icon: 'wardrobe',
    short_desc: 'Fitted wardrobes planned around what goes inside them, then finished to match the room.',
    description:
      'Wardrobes are designed from the inside out — hanging heights, shelf depths and drawer layouts worked out around what you actually store, then wrapped in a finish that belongs with the rest of the room.',
    image_url: P.wardrobe1,
    highlights: ['Sliding and hinged shutters', 'Organised interiors', 'Loft storage integrated', 'Finish matched to the room'],
  },
  {
    title: 'Modular Furniture',
    icon: 'sofa',
    short_desc: 'TV units, crockery units and storage built to the exact wall rather than bought to fit.',
    description:
      'Loose furniture rarely suits the wall it has to live on. We build to the wall instead, so proportions, storage and cable routing are resolved as part of the design rather than worked around afterwards.',
    image_url: P.interiors,
    highlights: ['Made to the exact wall', 'Concealed cable management', 'Matching finish family', 'Storage planned in'],
  },
  {
    title: 'Kitchen Appliances',
    icon: 'appliance',
    short_desc: 'Chimneys, hobs, ovens and sinks specified alongside the kitchen, not added afterwards.',
    description:
      'Appliances are chosen at the design stage so the duct route, hob cut-out, oven housing and sink drop are all built into the cabinetry. Nothing is retrofitted, and nothing looks like an afterthought.',
    image_url: P.appliances,
    highlights: ['Chimneys and hobs', 'Built-in ovens', 'Sinks and fittings', 'Installed with the kitchen'],
  },
];

/** The six layouts described on the Modular Kitchen page. */
const LAYOUTS = [
  { title: 'L-Shaped Kitchen', description: 'Perfect for maximizing corner spaces while maintaining an open and efficient workflow.', image_url: P.kitchen2 },
  { title: 'U-Shaped Kitchen', description: 'Designed for larger spaces, offering ample storage, countertop area, and convenience.', image_url: P.kitchen3 },
  { title: 'Parallel Kitchen', description: 'A highly functional layout featuring two parallel workspaces for efficient cooking and movement.', image_url: P.kitchen7 },
  { title: 'Straight Kitchen', description: 'A clean and minimalist design ideal for compact homes and modern apartments.', image_url: P.kitchen8 },
  { title: 'Island Kitchen', description: 'An elegant layout that combines functionality and social interaction with a central workspace.', image_url: P.kitchen9 },
  { title: 'Open Kitchen', description: 'Seamlessly connects the kitchen with living spaces, creating a spacious and contemporary feel.', image_url: P.kitchenAlt },
];

/** "Designed for Performance, Built to Last" — the studio's own list. */
const MATERIALS = [
  { name: 'Premium Quality Materials', category: 'promise', description: 'Materials chosen to hold up to daily use in an Indian kitchen.', image_url: P.signature, swatch_hex: '#7D1416' },
  { name: 'Smart Storage Solutions', category: 'promise', description: 'Storage planned around what you keep and how often you reach for it.', image_url: P.kitchen2, swatch_hex: '#5A0E10' },
  { name: 'Customized Designs', category: 'promise', description: 'Every layout drawn for your room rather than adapted from a catalogue.', image_url: P.classic, swatch_hex: '#A3302F' },
  { name: 'Precision Manufacturing', category: 'promise', description: 'Panels cut and assembled to the millimetre in a controlled environment.', image_url: P.kitchen7, swatch_hex: '#16165F' },
  { name: 'Professional Installation', category: 'promise', description: 'Fitted by our own team, with the site left clean at the end of each day.', image_url: P.work1, swatch_hex: '#8C8C8C' },
  { name: 'Dedicated Customer Support', category: 'promise', description: 'One point of contact from the first discussion through to handover.', image_url: P.interiors, swatch_hex: '#B5B5B5' },
];

/**
 * Completed work. Titles describe what is shown — no client names, addresses
 * or dates are invented. Those can be filled in from the admin panel.
 */
const PROJECTS = [
  { title: 'Modular Kitchen in Ivory and Wood', category: 'modular-kitchen', is_featured: true, summary: 'A warm, light kitchen pairing ivory shutters with wood-toned tall units.', cover_image: P.signature, images: [P.signature, P.kitchen2, P.work1] },
  { title: 'Contemporary Modular Kitchen', category: 'modular-kitchen', is_featured: true, summary: 'Clean lines and handleless shutters in a contemporary apartment kitchen.', cover_image: P.kitchen, images: [P.kitchen, P.kitchen3] },
  { title: 'Classic Kitchen with Shaker Shutters', category: 'modular-kitchen', is_featured: true, summary: 'A classical kitchen executed in modular construction.', cover_image: P.classic, images: [P.classic, P.classic2] },
  { title: 'Compact Modular Kitchen', category: 'modular-kitchen', is_featured: true, summary: 'A tight footprint stacked to the ceiling to recover every inch of storage.', cover_image: P.kitchen8, images: [P.kitchen8, P.kitchen9] },
  { title: 'Open Kitchen and Dining', category: 'modular-kitchen', is_featured: true, summary: 'A kitchen that opens into the living space without opening onto the mess.', cover_image: P.kitchenAlt, images: [P.kitchenAlt, P.kitchen7] },
  { title: 'Modular Kitchen with Tall Unit Wall', category: 'modular-kitchen', is_featured: true, summary: 'Full-height storage along one wall keeps the working counters clear.', cover_image: P.work2, images: [P.work2, P.work3] },
  { title: 'Sliding Wardrobe', category: 'wardrobes-storage', summary: 'A fitted sliding wardrobe with the interiors planned around what goes in it.', cover_image: P.wardrobe1, images: [P.wardrobe1, P.wardrobe2] },
  { title: 'Fitted Bedroom Wardrobe', category: 'wardrobes-storage', summary: 'Floor-to-ceiling storage finished to match the rest of the bedroom.', cover_image: P.wardrobe3, images: [P.wardrobe3, P.wardrobe2] },
  { title: 'Interior Spaces', category: 'interior-spaces', summary: 'Thoughtfully designed for comfort and style.', cover_image: P.interiors, images: [P.interiors, P.work1] },
  { title: 'Kitchen Appliances Installation', category: 'modular-kitchen', summary: 'Chimney, hob and built-in appliances planned into the cabinetry.', cover_image: P.appliances, images: [P.appliances, P.kitchen3] },
];

/** Only the reviews the studio actually publishes. */
const TESTIMONIALS = [
  {
    name: 'Amee Patel',
    project: 'modular-kitchen-in-ivory-and-wood',
    rating: 5,
    message:
      'I wanted to express my appreciation for the beautiful kitchen you guys created for me. The design is stunning, and the quality of materials used exceeded my expectations. The attention to detail in the installation process was also commendable. Always top notch in communication and coordination during the project. Overall, I am highly satisfied with the outcome and look forward to recommending your services to others. Special thanks to Chandanbhai, Vimla and their hardworking team.',
  },
  {
    name: 'Rupal Patel',
    project: 'classic-kitchen-with-shaker-shutters',
    rating: 5,
    message:
      'This review is for Tanushree Designs for getting my modular kitchen done! It has been an amazing journey with Chandan ji and Vimala ji, very knowledgeable and polite people with great business sense! I had hundreds of questions about this whole project from design to material, and I must say, they answered each and every question with so much patience and confidence! I am happy with the final result and sharing pics with you all! I strongly recommend Tanushree for modular kitchen.',
  },
];

/** The team as listed on the About page. */
const TEAM = [
  { name: 'Chandan Tikyani', role: 'Founder & Director' },
  { name: 'Vimla Tikyani', role: 'Co-Founder & Principal Interior Designer' },
  { name: 'Bhautik Prajapati', role: 'Kitchen Designer' },
  { name: 'Kamani Prajapati', role: 'Kitchen Designer' },
  { name: 'Satyam Prajapati', role: 'Operation Head' },
  { name: 'Kruti Dad', role: 'Human Resource' },
  { name: 'Madan', role: 'Site Supervisor' },
];

/** "Your dream space in 3 steps!" */
const PROCESS = [
  {
    step_no: 1,
    title: 'Consult & Understand',
    icon: 'compass',
    description:
      'Every successful kitchen begins with understanding the people who will use it. We take the time to learn about your lifestyle, cooking habits, storage requirements, design preferences, and available space. Through detailed discussions and site assessments, we gather the insights needed to create a kitchen that is both practical and personalized.',
  },
  {
    step_no: 2,
    title: 'Design & Customize',
    icon: 'pencil',
    description:
      'Once we understand your vision, our design team transforms ideas into a tailored kitchen concept. From layout planning and storage solutions to materials, finishes, colors, and accessories, every detail is carefully selected to match your needs and aesthetic preferences. We refine the design until it perfectly balances functionality, comfort, and style.',
  },
  {
    step_no: 3,
    title: 'Manufacture, Deliver & Install',
    icon: 'tools',
    description:
      'With the design finalized, we bring your kitchen to life using quality materials, precision craftsmanship, and meticulous attention to detail. Our team manages the installation process efficiently, ensuring every component is fitted seamlessly. The result is a modular kitchen that is durable, functional, and designed to serve your family for years to come.',
  },
];

/**
 * No counters are seeded. The studio does not publish project numbers or
 * years in business, and inventing them would put false claims on the site.
 * Add real figures under Admin -> Stats and the band appears by itself.
 */
const STATS = [];

/** Answered from the studio's own published copy only. */
const FAQS = [
  { category: 'process', question: 'What does the design process involve?', answer: 'Three stages. First we consult and understand — your lifestyle, cooking habits, storage needs and the space itself. Then we design and customize, working through layout, storage, materials, finishes and accessories until the design balances function and style. Finally we manufacture, deliver and install, managing the fitting so every component goes in seamlessly.' },
  { category: 'kitchen', question: 'Which kitchen layout will suit my space?', answer: 'We work with L-shaped, U-shaped, parallel, straight, island and open layouts. The right one depends on the shape of your room, where the plumbing sits and how many people cook at once — bring your floor plan to the studio and we will talk it through.' },
  { category: 'process', question: 'Do you handle installation yourselves?', answer: 'Yes. Installation is managed by our own team, so the same people are accountable for the fit and the finish.' },
  { category: 'process', question: 'Do you design more than kitchens?', answer: 'Yes. Alongside modular kitchens we design wardrobes, modular furniture and complete interior spaces, and we supply kitchen appliances as part of the kitchen.' },
  { category: 'general', question: 'Where is your studio?', answer: 'C-103, Sarkhej - Gandhinagar Hwy, near Gota Flyover, Vasant Nagar, Ognaj, Ahmedabad, Gujarat 380060. You are welcome to visit and see materials and finishes in person.' },
  { category: 'general', question: 'How do I start a project?', answer: 'Call +91-9881697860, message us on WhatsApp, or send your floor plan through the contact form and we will get back to you.' },
];

const PAGES = [
  {
    slug: 'home',
    title: 'Home',
    hero_title: 'Designed for Living. Crafted for Your Home.',
    hero_subtitle:
      'From modular kitchens to complete interior furnishings, we create spaces that combine thoughtful design, smart functionality, and timeless aesthetics for modern homes.',
    hero_image: P.hero,
    seo_title: 'Modular Kitchen & Elica Kitchen Chimney | Tanushree Designs',
    seo_description:
      'Tanushree Designs creates modular kitchens, wardrobes and complete interior solutions in Ahmedabad — thoughtful design, smart functionality and timeless aesthetics.',
    sections: {
      intro_eyebrow: 'About Us',
      intro_title: 'Designed around the way you live',
      intro_text:
        'We specialize in modular kitchens and interior solutions designed to enhance everyday living. By combining practical layouts, quality materials, and attention to detail, we create spaces that are both beautiful and functional for the way people truly live.',
      services_eyebrow: 'What We Do',
      services_title: 'Everything your home needs, under one roof',
      services_text:
        'Modular kitchens, wardrobes, furniture and appliances — designed together and installed together, so every finish belongs to the same family.',
      work_eyebrow: 'Our Work',
      work_title: 'Spaces We’ve Brought to Life',
      work_text:
        'Every project reflects our commitment to thoughtful design, skilled craftsmanship, and interiors that feel both practical and inspiring. Explore some of the homes and spaces we’ve had the privilege to design.',
      story_eyebrow: 'Our Story',
      story_title: 'Spaces that feel personal, practical, and beautifully designed.',
      story_text:
        'Our journey began with a simple belief that well-designed interiors can transform the way people experience their homes. From modular kitchens to complete interior furnishings, we focus on creating spaces that balance style with functionality. We work closely with homeowners to design interiors that reflect their lifestyle while ensuring comfort, durability, and timeless appeal.',
      story_image: P.classic2,
      testimonials_eyebrow: 'Testimonials',
      testimonials_title: 'What our clients say',
      cta_title: 'Your Dream Space Is Just a Conversation Away!',
      cta_text: 'Let’s bring your vision to life with thoughtful design and flawless execution.',
      cta_image: P.kitchen,
    },
  },
  {
    slug: 'about',
    title: 'About Us',
    hero_title: 'Designing Spaces That Feel Like Home',
    hero_subtitle:
      'From modular kitchens to complete interior solutions, we create thoughtfully designed spaces that combine functionality, comfort, and timeless aesthetics.',
    hero_image: P.interiors,
    seo_title: 'About Us | Tanushree Designs',
    seo_description:
      'What started as a passion for creating functional spaces has grown into a practice focused on designing homes that truly reflect the people living in them.',
    sections: {
      story_title: 'From Passion to Thoughtfully Designed Spaces',
      story_text:
        'What started as a passion for creating functional spaces has grown into a practice focused on designing homes that truly reflect the people living in them. We believe that every space should be both practical and visually refined. From modular kitchens to full interior furnishings, our approach is rooted in understanding lifestyles, optimizing layouts, and selecting materials that stand the test of time. Each project is a collaboration where design meets purpose, and ideas are transformed into spaces that feel effortless to live in.',
      studio_image: P.work1,
      team_title: 'Meet Our Team',
      team_text: 'A team driven by design, detail, and a shared vision of creating meaningful spaces.',
      values_title: 'Designed for Performance, Built to Last',
      values: [
        { title: 'Premium Quality Materials', text: 'Materials chosen to hold up to daily use.' },
        { title: 'Smart Storage Solutions', text: 'Storage planned around how you actually use the room.' },
        { title: 'Customized Designs', text: 'Every layout drawn for your space, not adapted from a catalogue.' },
        { title: 'Professional Installation', text: 'Fitted by our own team, start to finish.' },
      ],
    },
  },
  {
    slug: 'modular-kitchen',
    title: 'Modular Kitchen',
    hero_title: 'Modular Kitchens Designed for Modern Living',
    hero_subtitle:
      'From compact layouts to spacious open kitchens, we create customized solutions that maximize efficiency while reflecting your personal style.',
    hero_image: P.kitchen,
    seo_title: 'Modular Kitchen | Tanushree Designs',
    seo_description:
      'L-shaped, U-shaped, parallel, straight, island and open modular kitchens designed and installed in Ahmedabad by Tanushree Designs.',
    sections: {
      layouts_eyebrow: 'Kitchen Layouts',
      layouts_title: 'Smart Designs for Everyday Living',
      layouts_text:
        'A well-designed modular kitchen is more than just a cooking space — it is the heart of the home. Our kitchens are thoughtfully planned to combine functionality, intelligent storage, and elegant aesthetics, ensuring every corner works seamlessly for your lifestyle.',
      materials_eyebrow: 'Why Choose Us',
      materials_title: 'Designed for Performance, Built to Last',
      materials_text: 'What you get with every kitchen we design, manufacture and install.',
      appliance_eyebrow: 'Appliances',
      appliance_title: 'Chimneys, hobs and built-in appliances',
      appliance_text:
        'Appliances are specified alongside the kitchen so the duct route and cut-outs are built into the cabinetry rather than cut into it later.',
      appliance_image: P.appliances,
      faq_eyebrow: 'Questions',
      faq_title: 'Before you start, you probably want to know',
    },
  },
  {
    slug: 'our-work',
    title: 'Our Work',
    hero_title: 'A Collection of Spaces We’ve Designed',
    hero_subtitle: 'Our goal is to make your dreams a reality.',
    hero_image: P.work3,
    seo_title: 'Our Work | Tanushree Designs',
    seo_description:
      'A collection of modular kitchens, wardrobes and interior spaces designed and installed by Tanushree Designs in Ahmedabad.',
    sections: {},
  },
  {
    slug: 'contact',
    title: 'Contact Us',
    hero_title: 'Let’s Create a Space You’ll Love',
    hero_subtitle:
      'We’d love to hear from you. Visit the studio to explore design ideas, materials and finishes, and discuss how we can bring your project to life.',
    hero_image: P.work2,
    seo_title: 'Contact Us | Tanushree Designs',
    seo_description:
      'Visit our studio near Gota Flyover, Ahmedabad. Call +91-9881697860 or send us your floor plan.',
    sections: {
      form_title: 'Get in touch',
      form_text: 'Send us your project details and we will come back to you.',
      visit_title: 'Visit the studio',
      visit_text:
        'You are welcome to come and see materials and finishes in person before deciding anything.',
    },
  },
];


// ===================================================================
//  Kitchen price calculator
// ===================================================================

/**
 * PLACEHOLDER RATES — every price below is 0 on purpose.
 *
 * The studio does not publish rates, and inventing them would put false
 * numbers in front of customers. Set the real figures in
 * Admin -> Calculator before promoting the page.
 *
 * A package with a rate of 0 is treated as "not priced yet": the
 * calculator hides the number and invites the visitor to request a quote
 * instead, so the page is useful and honest either way.
 */
const CALC_LAYOUTS = [
  {
    title: 'L-Shaped Kitchen',
    description: 'Two runs meeting in a corner — the most common apartment layout.',
    image_url: '/images/layouts/l-shaped.svg',
    segments: [
      { label: 'A', min: 4, max: 20, default: 6 },
      { label: 'B', min: 4, max: 24, default: 9 },
    ],
  },
  {
    title: 'Straight Kitchen',
    description: 'Everything along a single wall. Ideal for compact homes.',
    image_url: '/images/layouts/straight.svg',
    segments: [{ label: 'A', min: 4, max: 24, default: 10 }],
  },
  {
    title: 'U-Shaped Kitchen',
    description: 'Three connected runs, giving the most counter and storage.',
    image_url: '/images/layouts/u-shaped.svg',
    segments: [
      { label: 'A', min: 4, max: 20, default: 6 },
      { label: 'B', min: 4, max: 24, default: 9 },
      { label: 'C', min: 4, max: 20, default: 6 },
    ],
  },
  {
    title: 'Parallel Kitchen',
    description: 'Two facing runs with a walkway between them.',
    image_url: '/images/layouts/parallel.svg',
    segments: [
      { label: 'A', min: 4, max: 24, default: 9 },
      { label: 'B', min: 4, max: 24, default: 9 },
    ],
  },
  {
    title: 'Island Kitchen',
    description: 'A wall run plus a freestanding island for prep and seating.',
    image_url: '/images/layouts/island.svg',
    segments: [
      { label: 'A', min: 6, max: 24, default: 12 },
      { label: 'B', min: 3, max: 12, default: 6 },
    ],
  },
];

const CALC_PACKAGES = [
  {
    title: 'Essentials',
    tier: 2,
    description:
      'The units and accessories needed for a comfortable, hard-wearing modular kitchen.',
    image_url: P.kitchen8,
    features: ['Laminate shutters', 'Soft-close hinges', 'Standard accessories', 'Granite countertop'],
    rate_per_ft: 0,
  },
  {
    title: 'Premium',
    tier: 3,
    description:
      'Sleeker fixtures, better hardware and a wider choice of finishes throughout.',
    image_url: P.kitchen,
    features: ['Acrylic or PU shutters', 'Tandem box drawers', 'Wider accessory range', 'Quartz countertop'],
    rate_per_ft: 0,
  },
  {
    title: 'Luxe',
    tier: 4,
    description:
      'Our most complete specification, blending aesthetics with heavy daily use.',
    image_url: P.classic,
    features: ['Premium finishes', 'Full internal organisers', 'Designer hardware', 'Integrated lighting'],
    rate_per_ft: 0,
  },
];

/** Optional extras, priced individually. */
const CALC_ADDONS = [
  { title: 'Elica Kitchen Chimney', category: 'appliance', description: 'Auto-clean filterless chimney, ducted out through the utility.', image_url: P.appliances, price: 0 },
  { title: 'Built-in Hob', category: 'appliance', description: 'Glass-top gas hob cut into the counter.', image_url: P.kitchen3, price: 0 },
  { title: 'Built-in Oven', category: 'appliance', description: 'Oven housed in a tall unit at eye level.', image_url: P.kitchen7, price: 0 },
  { title: 'Sink & Faucet', category: 'fitting', description: 'Stainless or quartz sink with a pull-out faucet.', image_url: P.work1, price: 0 },
  { title: 'Tall Unit / Pantry', category: 'storage', description: 'Full-height pull-out pantry beside the fridge.', image_url: P.kitchen2, price: 0 },
  { title: 'Profile Lighting', category: 'lighting', description: 'Warm LED profile lighting under the wall units.', image_url: P.kitchenAlt, price: 0 },
];

const SETTINGS = [
  {
    key: 'brand',
    group_name: 'brand',
    label: 'Brand identity & colours',
    value: {
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
  },
  {
    key: 'contact',
    group_name: 'contact',
    label: 'Contact details',
    value: {
      phone: '+91-9881697860',
      phone_raw: '919881697860',
      whatsapp: '9881697860',
      email: 'info@tanushreedesigns.in',
      address:
        'C-103, Sarkhej - Gandhinagar Hwy, near Gota Flyover, Vasant Nagar, Ognaj, Ahmedabad, Gujarat 380060',
      city: 'Ahmedabad',
      hours: 'Mon - Sat, 10:00 am - 8:00 pm',
      // Business name plus the full address geocodes to the studio itself
      // rather than the middle of the highway.
      map_embed:
        'https://www.google.com/maps?q=Tanushree+Designs%2C+C-103%2C+Sarkhej+-+Gandhinagar+Hwy%2C+near+Gota+Flyover%2C+Vasant+Nagar%2C+Ognaj%2C+Ahmedabad%2C+Gujarat+380060&z=16&output=embed',
      map_link:
        'https://www.google.com/maps/dir/?api=1&destination=Tanushree+Designs%2C+C-103%2C+Sarkhej+-+Gandhinagar+Hwy%2C+near+Gota+Flyover%2C+Vasant+Nagar%2C+Ognaj%2C+Ahmedabad%2C+Gujarat+380060',
    },
  },
  {
    key: 'social',
    group_name: 'contact',
    label: 'Social profiles',
    value: { instagram: '', facebook: '', youtube: '', pinterest: '', linkedin: '' },
  },
  {
    key: 'hero_slides',
    group_name: 'home',
    label: 'Home page hero slides',
    value: [
      {
        image: P.hero,
        eyebrow: 'Modular Kitchens & Interiors',
        title: 'Designed for Living. Crafted for Your Home.',
        text: 'From modular kitchens to complete interior furnishings, we create spaces that combine thoughtful design, smart functionality, and timeless aesthetics.',
      },
      {
        image: P.kitchen,
        eyebrow: 'Modular Kitchens',
        title: 'Smart Designs for Everyday Living',
        text: 'Thoughtfully planned to combine functionality, intelligent storage and elegant aesthetics.',
      },
      {
        image: P.wardrobe1,
        eyebrow: 'Wardrobes & Storage',
        title: 'Storage planned from the inside out.',
        text: 'Fitted wardrobes designed around what goes in them, finished to match the room.',
      },
    ],
  },
  {
    key: 'usps',
    group_name: 'home',
    label: 'Trust strip',
    value: [
      { icon: 'award', title: 'Premium Materials', text: 'Chosen to last in daily use' },
      { icon: 'ruler', title: 'Customized Designs', text: 'Drawn for your space' },
      { icon: 'tools', title: 'Precision Manufacturing', text: 'Built to the millimetre' },
      { icon: 'check', title: 'Professional Installation', text: 'Fitted by our own team' },
    ],
  },
  {
    key: 'seo',
    group_name: 'seo',
    label: 'Default SEO',
    value: {
      site_title: 'Modular Kitchen & Elica Kitchen Chimney | Tanushree Designs',
      description:
        'Modular kitchens, wardrobes and complete interior solutions in Ahmedabad. Thoughtful design, smart functionality and timeless aesthetics.',
      keywords:
        'modular kitchen ahmedabad, interior designer ahmedabad, kitchen chimney, wardrobes, kitchen design',
      og_image: P.hero,
    },
  },
  {
    key: 'calculator',
    group_name: 'calculator',
    label: 'Price calculator',
    value: {
      enabled: true,
      range_percent: 12,
      currency: '₹',
      headline: 'Kitchen Price Calculator',
      subhead:
        'Answer four quick questions and we will send an indicative estimate for your kitchen.',
      disclaimer:
        'This is an indicative estimate based on the sizes you entered. Final pricing is confirmed after a site measurement and your choice of finishes.',
      success_message:
        'Thank you. Our design team will call you to talk the estimate through.',
    },
  },
  {
    key: 'announcement',
    group_name: 'general',
    label: 'Top announcement bar',
    value: {
      enabled: true,
      text: 'Visit our Ognaj studio to explore design ideas, materials and finishes',
      link_text: 'Get in touch',
      link_url: '/contact-us',
    },
  },
];

// ===================================================================
//  Runner
// ===================================================================

const slugify = (s) =>
  String(s).toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL || 'admin@tanushreedesigns.in';
  const password = process.env.ADMIN_PASSWORD || 'Admin@12345';
  const name = process.env.ADMIN_NAME || 'Tanushree Admin';
  const hash = await bcrypt.hash(password, 10);

  await pool.query(
    `INSERT INTO admin_users (name, email, password_hash, role)
     VALUES ($1, $2, $3, 'owner')
     ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, password_hash = EXCLUDED.password_hash`,
    [name, email, hash]
  );
  console.log(`  admin user      -> ${email}`);
}

async function run() {
  console.log('\nSeeding Tanushree Designs database...\n');

  await seedAdmin();

  for (const s of SETTINGS) {
    await pool.query(
      `INSERT INTO site_settings (key, value, label, group_name)
       VALUES ($1, $2::jsonb, $3, $4)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, label = EXCLUDED.label, group_name = EXCLUDED.group_name`,
      [s.key, JSON.stringify(s.value), s.label, s.group_name]
    );
  }
  console.log(`  site settings   -> ${SETTINGS.length}`);

  // Clear content tables before re-inserting so rows removed from this file
  // do not linger in the database. Projects go first: categories are their
  // parent, and testimonials point at projects.
  await pool.query('DELETE FROM testimonials');
  await pool.query('DELETE FROM projects');
  await pool.query('DELETE FROM categories');
  await pool.query('DELETE FROM services');

  const categoryIds = {};
  for (const [i, c] of CATEGORIES.entries()) {
    const { rows } = await pool.query(
      `INSERT INTO categories (name, slug, description, sort_order)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description
       RETURNING id`,
      [c.name, c.slug, c.description, i]
    );
    categoryIds[c.slug] = rows[0].id;
  }
  console.log(`  categories      -> ${CATEGORIES.length}`);

  for (const [i, s] of SERVICES.entries()) {
    await pool.query(
      `INSERT INTO services (title, slug, short_desc, description, icon, image_url, highlights, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8)
       ON CONFLICT (slug) DO UPDATE SET
         title = EXCLUDED.title, short_desc = EXCLUDED.short_desc, description = EXCLUDED.description,
         icon = EXCLUDED.icon, image_url = EXCLUDED.image_url, highlights = EXCLUDED.highlights,
         sort_order = EXCLUDED.sort_order`,
      [s.title, slugify(s.title), s.short_desc, s.description, s.icon, s.image_url, JSON.stringify(s.highlights), i]
    );
  }
  console.log(`  services        -> ${SERVICES.length}`);

  await pool.query('DELETE FROM kitchen_layouts');
  for (const [i, l] of LAYOUTS.entries()) {
    await pool.query(
      `INSERT INTO kitchen_layouts (title, slug, description, image_url, features, sort_order)
       VALUES ($1,$2,$3,$4,$5::jsonb,$6)`,
      [l.title, slugify(l.title), l.description, l.image_url, JSON.stringify([]), i]
    );
  }
  console.log(`  kitchen layouts -> ${LAYOUTS.length}`);

  await pool.query('DELETE FROM materials');
  for (const [i, m] of MATERIALS.entries()) {
    await pool.query(
      `INSERT INTO materials (name, category, description, image_url, swatch_hex, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [m.name, m.category, m.description, m.image_url, m.swatch_hex, i]
    );
  }
  console.log(`  why choose us   -> ${MATERIALS.length}`);

  const projectIds = {};
  for (const [i, p] of PROJECTS.entries()) {
    if (p.category && !categoryIds[p.category]) {
      throw new Error(`Project "${p.title}" references unknown category "${p.category}"`);
    }
    const slug = slugify(p.title);
    const { rows } = await pool.query(
      `INSERT INTO projects (title, slug, category_id, summary, cover_image, tags, is_featured, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7,$8) RETURNING id`,
      [p.title, slug, categoryIds[p.category] ?? null, p.summary, p.cover_image, JSON.stringify([]), Boolean(p.is_featured), i]
    );
    projectIds[slug] = rows[0].id;

    for (const [j, url] of (p.images ?? []).entries()) {
      await pool.query(
        'INSERT INTO project_images (project_id, image_url, caption, sort_order) VALUES ($1,$2,$3,$4)',
        [rows[0].id, url, `${p.title} — view ${j + 1}`, j]
      );
    }
  }
  console.log(`  projects        -> ${PROJECTS.length}`);

  for (const [i, t] of TESTIMONIALS.entries()) {
    const pid = t.project ? projectIds[t.project] ?? null : null;
    if (t.project && !pid) {
      throw new Error(`Testimonial "${t.name}" references unknown project "${t.project}"`);
    }
    await pool.query(
      `INSERT INTO testimonials (name, location, rating, message, avatar_url, project_id, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [t.name, null, t.rating, t.message, null, pid, i]
    );
  }
  console.log(`  testimonials    -> ${TESTIMONIALS.length}`);

  await pool.query('DELETE FROM team_members');
  for (const [i, m] of TEAM.entries()) {
    await pool.query(
      'INSERT INTO team_members (name, role, bio, photo_url, sort_order) VALUES ($1,$2,$3,$4,$5)',
      [m.name, m.role, null, null, i]
    );
  }
  console.log(`  team members    -> ${TEAM.length}`);

  await pool.query('DELETE FROM process_steps');
  for (const s of PROCESS) {
    await pool.query(
      'INSERT INTO process_steps (step_no, title, description, icon) VALUES ($1,$2,$3,$4)',
      [s.step_no, s.title, s.description, s.icon]
    );
  }
  console.log(`  process steps   -> ${PROCESS.length}`);

  await pool.query('DELETE FROM stats');
  for (const [i, s] of STATS.entries()) {
    await pool.query('INSERT INTO stats (label, value, suffix, sort_order) VALUES ($1,$2,$3,$4)', [
      s.label, s.value, s.suffix, i,
    ]);
  }
  console.log(`  stats           -> ${STATS.length} (add real figures in the admin)`);

  await pool.query('DELETE FROM faqs');
  for (const [i, f] of FAQS.entries()) {
    await pool.query(
      'INSERT INTO faqs (question, answer, category, sort_order) VALUES ($1,$2,$3,$4)',
      [f.question, f.answer, f.category, i]
    );
  }
  console.log(`  faqs            -> ${FAQS.length}`);

  // ---------------------------------------------------- calculator
  await seedCalculator({ replace: true });
  console.log(
    `  calculator      -> ${CALC_LAYOUTS.length} layouts, ${CALC_PACKAGES.length} packages, ${CALC_ADDONS.length} add-ons`
  );
  console.log('                     rates are 0 — set them in Admin -> Calculator');

  for (const p of PAGES) {
    await pool.query(
      `INSERT INTO pages (slug, title, hero_title, hero_subtitle, hero_image, sections, seo_title, seo_description)
       VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7,$8)
       ON CONFLICT (slug) DO UPDATE SET
         title = EXCLUDED.title, hero_title = EXCLUDED.hero_title, hero_subtitle = EXCLUDED.hero_subtitle,
         hero_image = EXCLUDED.hero_image, sections = EXCLUDED.sections, seo_title = EXCLUDED.seo_title,
         seo_description = EXCLUDED.seo_description, updated_at = NOW()`,
      [p.slug, p.title, p.hero_title, p.hero_subtitle, p.hero_image, JSON.stringify(p.sections), p.seo_title, p.seo_description]
    );
  }
  console.log(`  pages           -> ${PAGES.length}`);

  console.log('\nSeed complete.\n');
}

export { run as seed };

/**
 * True when the database has no admin user yet, i.e. nothing has been set up.
 * Lets the server seed a fresh managed database exactly once, without ever
 * overwriting content someone has since edited.
 */
/**
 * Fill the calculator tables.
 *
 * The calculator arrived after the site was already live, so this has to be
 * safe to run against a database full of real content: by default it only
 * touches a table that is empty, and it never overwrites rates the studio has
 * since entered. `replace: true` is the full-seed behaviour.
 *
 * @returns {Promise<boolean>} whether anything was written
 */
export async function seedCalculator({ replace = false } = {}) {
  const isEmpty = async (table) => {
    const { rows } = await pool.query(`SELECT COUNT(*)::int AS n FROM ${table}`);
    return rows[0].n === 0;
  };

  let wrote = false;

  if (replace || (await isEmpty('calc_layouts'))) {
    if (replace) await pool.query('DELETE FROM calc_layouts');
    for (const [i, l] of CALC_LAYOUTS.entries()) {
      await pool.query(
        `INSERT INTO calc_layouts (title, slug, description, image_url, segments, sort_order)
         VALUES ($1,$2,$3,$4,$5::jsonb,$6)`,
        [l.title, slugify(l.title), l.description, l.image_url, JSON.stringify(l.segments), i]
      );
    }
    wrote = true;
  }

  if (replace || (await isEmpty('calc_packages'))) {
    if (replace) await pool.query('DELETE FROM calc_packages');
    for (const [i, k] of CALC_PACKAGES.entries()) {
      await pool.query(
        `INSERT INTO calc_packages (title, slug, tier, description, image_url, features, rate_per_ft, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7,$8)`,
        [k.title, slugify(k.title), k.tier, k.description, k.image_url, JSON.stringify(k.features), k.rate_per_ft, i]
      );
    }
    wrote = true;
  }

  if (replace || (await isEmpty('calc_addons'))) {
    if (replace) await pool.query('DELETE FROM calc_addons');
    for (const [i, a] of CALC_ADDONS.entries()) {
      await pool.query(
        `INSERT INTO calc_addons (title, slug, description, image_url, price, category, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [a.title, slugify(a.title), a.description, a.image_url, a.price, a.category, i]
      );
    }
    wrote = true;
  }

  // The headline, disclaimer and estimate spread live in settings. Only add
  // the row if it is missing, so wording the studio has edited survives.
  const calcSettings = SETTINGS.find((x) => x.key === 'calculator');
  if (calcSettings) {
    await pool.query(
      `INSERT INTO site_settings (key, value, label, group_name)
       VALUES ($1, $2::jsonb, $3, $4)
       ON CONFLICT (key) DO NOTHING`,
      [
        calcSettings.key,
        JSON.stringify(calcSettings.value),
        calcSettings.label,
        calcSettings.group_name,
      ]
    );
  }

  return wrote;
}

export async function isEmptyDatabase() {
  try {
    const { rows } = await pool.query('SELECT COUNT(*)::int AS n FROM admin_users');
    return rows[0].n === 0;
  } catch {
    return false; // table missing => migration has not run, so do not seed
  }
}

// Only self-execute when invoked directly; importing must not close the pool.
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  run()
    .then(() => pool.end())
    .catch(async (err) => {
      console.error('[seed] failed:', err.message);
      await pool.end().catch(() => {});
      process.exit(1);
    });
}
