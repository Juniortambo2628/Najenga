import { useCallback, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, usePage } from '@inertiajs/react';
import { useAdminChrome } from '@okjt/dashboard';
import { PageHeadingContext, fallbackHeading } from '@/Layouts/PageHeadingContext';

/**
 * The layout every dashboard page wraps itself in. The frame (sidebar,
 * header) is the OKJT kit's DashboardShell, around every page already
 * (frontend/src/dashboard/DashboardApp.jsx), so this does what is the page's
 * own: its title in the header (compact once the page's DashboardHero
 * scrolls away), from PageHeadingContext.
 */
export function NavbarTitle({ heading, hero }) {
  // The page's hero is the kit's: it shows its own compact title.
  if (hero?.kit) return null;
  if (!hero) {
    return <span className="text-white font-semibold hidden md:block truncate">{heading}</span>;
  }
  return (
    <AnimatePresence initial={false}>
      {!hero.visible && (
        <motion.div
          key="compact-title"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15 }}
          className="flex items-center gap-3 min-w-0"
        >
          <div className="min-w-0 leading-tight">
            {hero.parent && (
              <p className="hidden sm:block text-[11px] text-gray-400 truncate">
                {hero.parent.href ? <Link href={hero.parent.href} className="hover:text-white transition">{hero.parent.label}</Link> : hero.parent.label}
              </p>
            )}
            <p className="text-white font-semibold truncate">{heading}</p>
          </div>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="hidden md:inline text-xs text-gray-400 hover:text-white whitespace-nowrap transition"
            title="Back to top"
          >
            <i aria-hidden="true" className="fas fa-arrow-up mr-1"></i>Top
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function AuthenticatedLayout({ children }) {
  const { url, component } = usePage();
  const { titleSlot } = useAdminChrome();
  const [reported, setReported] = useState({ url: '', title: '', hero: null });
  const setHeading = useCallback((title) => setReported((r) => (r.url === url ? { ...r, title } : { url, title, hero: null })), [url]);
  const reportHero = useCallback((hero) => setReported((r) => (r.url === url ? { ...r, hero } : { url, title: '', hero })), [url]);
  const context = useMemo(() => ({ setHeading, reportHero }), [setHeading, reportHero]);
  const current = reported.url === url;
  const heading = current && reported.title ? reported.title : fallbackHeading(component);

  return (
    <PageHeadingContext.Provider value={context}>
      {titleSlot && createPortal(<NavbarTitle heading={heading} hero={current ? reported.hero : null} />, titleSlot)}
      {children}
    </PageHeadingContext.Provider>
  );
}
