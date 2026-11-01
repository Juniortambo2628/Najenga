import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { SiteProvider } from '@okjt/site';
import { site } from './site.config';
import Home from './pages/Home';

const Journey = lazy(() => import('./pages/Journey'));
const Legal = lazy(() => import('./pages/Legal'));

/** A page that hasn't moved here yet: let Laravel (Inertia) serve it. */
function ServerPage() {
  const { pathname, search, hash } = useLocation();
  useEffect(() => { window.location.replace(pathname + search + hash); }, [pathname, search, hash]);
  return null;
}

/** Najenga's pages on the OKJT kit: the public pages so far. */
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
            <Route path="*" element={<ServerPage />} />
          </Routes>
        </Suspense>
      </SiteProvider>
    </BrowserRouter>
  );
}
