import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { SiteProvider } from '@okjt/site';
import { site } from './site.config';
import Home from './pages/Home';

const Journey = lazy(() => import('./pages/Journey'));
const DashboardApp = lazy(() => import('./dashboard/DashboardApp'));
const Legal = lazy(() => import('./pages/Legal'));

/** Najenga's pages on the OKJT kit: the public pages, then the dashboard. */
export default function App() {
  return (
    <BrowserRouter>
      <SiteProvider site={site}>
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/for-homeowners" element={<Journey id="homeowners" />} />
            <Route path="/for-contractors" element={<Journey id="contractors" />} />
            <Route path="/privacy" element={<Legal doc="privacy" />} />
            <Route path="/terms" element={<Legal doc="terms" />} />
            {/* Everything else: the dashboard. A page that hasn't moved yet reloads into Laravel. */}
            <Route path="*" element={<DashboardApp />} />
          </Routes>
        </Suspense>
      </SiteProvider>
    </BrowserRouter>
  );
}
