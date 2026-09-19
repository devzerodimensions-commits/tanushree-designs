import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import FloatingActions, { ScrollToTop } from './components/FloatingActions.jsx';

// The landing page is what most visitors hit first, so it ships in the main
// bundle. Everything else is fetched only when its route is opened — which
// keeps the whole admin panel out of the public download.
import Home from './pages/Home.jsx';

const About = lazy(() => import('./pages/About.jsx'));
const ModularKitchen = lazy(() => import('./pages/ModularKitchen.jsx'));
const Elica = lazy(() => import('./pages/Elica.jsx'));
const OurWork = lazy(() => import('./pages/OurWork.jsx'));
const Contact = lazy(() => import('./pages/Contact.jsx'));
const Calculator = lazy(() => import('./pages/Calculator.jsx'));
const CustomPage = lazy(() => import('./pages/CustomPage.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

const AdminLayout = lazy(() => import('./admin/AdminLayout.jsx'));
const Login = lazy(() => import('./admin/Login.jsx'));
const Dashboard = lazy(() => import('./admin/Dashboard.jsx'));
const Projects = lazy(() => import('./admin/Projects.jsx'));
const Enquiries = lazy(() => import('./admin/Enquiries.jsx'));
const Media = lazy(() => import('./admin/Media.jsx'));
const PagesEditor = lazy(() => import('./admin/PagesEditor.jsx'));
const Settings = lazy(() => import('./admin/Settings.jsx'));

const resources = () => import('./admin/resources.jsx');
const ServicesPage = lazy(() => resources().then((m) => ({ default: m.ServicesPage })));
const LayoutsPage = lazy(() => resources().then((m) => ({ default: m.LayoutsPage })));
const MaterialsPage = lazy(() => resources().then((m) => ({ default: m.MaterialsPage })));
const CategoriesPage = lazy(() => resources().then((m) => ({ default: m.CategoriesPage })));
const TestimonialsPage = lazy(() => resources().then((m) => ({ default: m.TestimonialsPage })));
const TeamPage = lazy(() => resources().then((m) => ({ default: m.TeamPage })));
const ProcessPage = lazy(() => resources().then((m) => ({ default: m.ProcessPage })));
const StatsPage = lazy(() => resources().then((m) => ({ default: m.StatsPage })));
const FaqsPage = lazy(() => resources().then((m) => ({ default: m.FaqsPage })));
const ChimneyTypesPage = lazy(() => resources().then((m) => ({ default: m.ChimneyTypesPage })));
const CalcLayoutsPage = lazy(() => resources().then((m) => ({ default: m.CalcLayoutsPage })));
const CalcPackagesPage = lazy(() => resources().then((m) => ({ default: m.CalcPackagesPage })));
const CalcAddonsPage = lazy(() => resources().then((m) => ({ default: m.CalcAddonsPage })));
const Quotes = lazy(() => import('./admin/Quotes.jsx'));

/** Shown while a route chunk is being fetched. */
function RouteFallback() {
  return (
    <div className="page-loader">
      <span className="spinner spinner--dark" />
    </div>
  );
}

/** Public site chrome. */
function SiteShell({ children }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <FloatingActions />
    </>
  );
}

const page = (Component) => (
  <SiteShell>
    <Component />
  </SiteShell>
);

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          {/* ------------------------------------------------ public */}
          <Route path="/" element={page(Home)} />
          <Route path="/about-us" element={page(About)} />
          <Route path="/modular-kitchen" element={page(ModularKitchen)} />
          <Route path="/elica-chimney" element={page(Elica)} />
          <Route path="/our-work" element={page(OurWork)} />
          <Route path="/contact-us" element={page(Contact)} />
          <Route path="/kitchen-price-calculator" element={page(Calculator)} />

          {/* ------------------------------------------------- admin */}
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            {/* Taken out of the sidebar at the studio's request. The route
                stays so the Our Work gallery is not frozen for good — reach it
                at /admin/projects if a project ever needs changing. */}
            <Route path="projects" element={<Projects />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="kitchen-layouts" element={<LayoutsPage />} />
            <Route path="chimney-types" element={<ChimneyTypesPage />} />
            <Route path="materials" element={<MaterialsPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="testimonials" element={<TestimonialsPage />} />
            <Route path="team" element={<TeamPage />} />
            <Route path="process" element={<ProcessPage />} />
            <Route path="stats" element={<StatsPage />} />
            <Route path="faqs" element={<FaqsPage />} />
            <Route path="calc-layouts" element={<CalcLayoutsPage />} />
            <Route path="calc-packages" element={<CalcPackagesPage />} />
            <Route path="calc-addons" element={<CalcAddonsPage />} />
            <Route path="quotes" element={<Quotes />} />
            <Route path="pages" element={<PagesEditor />} />
            <Route path="media" element={<Media />} />
            <Route path="enquiries" element={<Enquiries />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Pages the studio builds in the admin. Last, so every
              hand-built route above still wins its address. */}
          <Route path="/:slug" element={page(CustomPage)} />

          <Route path="*" element={page(NotFound)} />
        </Routes>
      </Suspense>
    </>
  );
}
