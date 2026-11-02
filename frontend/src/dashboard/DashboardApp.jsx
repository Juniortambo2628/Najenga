import './globals';
import { lazy, Suspense, useEffect, useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { DashboardProvider, DashboardShell } from '@okjt/dashboard';
import '@/bootstrap';
import { InertiaBridge, usePage } from '@inertiajs/react';
import FlashToast from '@/Components/FlashToast';
import ConfirmHost from '@/Components/ConfirmHost';
import Tour from '@/Components/Tour';
import { setBadges, setOnline } from '@/Utils/presence';
import AccountMenu from '../najenga/shell/AccountMenu';
import GlobalSearch from '../najenga/shell/GlobalSearch';
import { HeaderStart, History, MenuIcon, Notifications, Online, Share } from '../najenga/shell/HeaderPieces';
import { http } from './api';
import { fa, loadFontAwesome } from './icons';
import { NAV_ITEMS, navFor } from './navigation';
import { PageDataProvider, seedFirstPage, usePageState } from './page';

/**
 * Najenga's dashboard on the OKJT kit: the kit's shell (sidebar, header,
 * presence) dressed as Najenga's, around Najenga's pages. Each page's
 * component comes from resources/js/Pages, named by the server
 * (App\Http\Page), with the page API in ../najenga/inertia.jsx.
 */
loadFontAwesome();

const PAGES = import.meta.glob('../../../resources/js/Pages/**/*.jsx');
const pageCache = new Map();
function pageComponent(name) {
  if (!pageCache.has(name)) {
    const load = PAGES[`../../../resources/js/Pages/${name}.jsx`];
    pageCache.set(name, load ? lazy(load) : null);
  }
  return pageCache.get(name);
}

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } } });
seedFirstPage(queryClient);

/**
 * The kit's API client, with presence answered by Najenga's own heartbeat
 * (POST /presence/heartbeat: who's online in your projects and on which
 * page, and the sidebar's change badges), which Najenga's own header pieces
 * read too.
 */
const api = {
  ...http,
  post: async (url, data, config) => {
    if (url !== '/collaboration/heartbeat') return http.post(url, data, config);
    const res = await http.post('/presence/heartbeat', { page: window.location.pathname });
    setOnline(res.data?.online);
    setBadges(res.data?.badges);
    return { data: { presence: (res.data?.online ?? []).map((p) => ({ ...p, current_module: p.page })), badges: res.data?.badges ?? {} } };
  },
};

/** Font Awesome names, and the names the kit asks for. */
const NAMED = {
  search: 'fa-magnifying-glass',
  'panel-expand': 'fa-angles-left',
  'panel-collapse': 'fa-angles-right',
  close: 'fa-xmark',
  'chevron-up': 'fa-chevron-up',
  'hide-toolbar': 'fa-chevron-down',
  filters: 'fa-sliders-h',
  more: 'fa-ellipsis-h',
  bookmark: 'fa-bookmark',
};
const iconFor = (name) => {
  const fas = NAMED[name] ?? name;
  return fas.startsWith('fa-') ? fa(fas, { brand: fas === 'fa-whatsapp' }) : null;
};

const MODULES = NAV_ITEMS.map((item) => ({ key: item.key, path: item.path, label: item.label }));

function Shell({ children }) {
  const { auth, component } = { ...usePage().props, component: usePage().component };
  const user = auth?.user ?? null;
  const nav = useMemo(() => navFor(user).map((section) => ({ title: section.title, items: section.items.map((item) => ({ ...item, id: `nav-${item.key}` })) })), [user]);

  const dashboard = {
    api,
    modules: MODULES,
    home: { label: 'Dashboard', path: '/dashboard' },
    // Kit components take Najenga's Font Awesome names ('fa-receipt').
    iconFor,
    // The kit's components in Najenga's dark, bold look.
    componentDefaults: { SidePanel: { variant: 'bold' }, FloatingToolbar: { variant: 'bold' } },
    roles: [
      { value: 'owner', label: 'Owner', description: 'Everything, including people and roles' },
      { value: 'editor', label: 'Editor', description: 'Adds and changes records' },
      { value: 'viewer', label: 'Viewer', description: 'Can look but not change anything' },
    ],
    shell: {
      logo: { src: '/Najenga-logos/Najenga-Logo-trimmed.webp', alt: 'Najenga', to: '/' },
      nav,
      collapsible: true,
      sidebarWidth: 256,
      railWidth: 80,
      background: '#0b0c0d',
      sidebarBackground: 'linear-gradient(to bottom, #1c0f12, #120a0b)',
      sidebarClass: 'border-r border-rose-950/40 shadow-2xl',
      sidebarScrollbar: 'rgba(255, 255, 255, 0.12) transparent',
      logoBoxClass: 'px-6 pb-4 pt-6 transition hover:bg-white/[0.04]',
      logoClass: 'h-20 w-full max-w-[9.5rem] object-contain',
      railLogoClass: 'h-9 w-12 object-contain',
      navClass: 'py-2 px-2 custom-scrollbar',
      navTitleClass: 'mb-1 px-3 text-xs font-semibold capitalize text-white/45',
      navItemClass: 'border border-transparent px-3 py-2 rounded-xl !gap-2.5',
      navActiveClass: 'bg-white/[0.08] border-white/[0.08] text-white font-semibold',
      navIdleClass: 'text-white/60 hover:bg-white/[0.06] hover:text-white',
      navLabelClass: 'truncate',
      badgeClass: 'bg-[#DC143C]/20 text-rose-200 font-semibold',
      headerBackground: 'rgb(11 12 13 / 0.9)',
      headerBorder: 'none',
      headerClass: 'px-4 !gap-0',
      headerStartClass: 'gap-1.5 sm:gap-4 min-w-0',
      headerEndClass: 'gap-1.5 sm:gap-4 min-w-0',
      menuButtonClass: 'text-gray-400 hover:bg-white/10 hover:text-white transition',
      MenuIcon,
      mainClass: 'flex-1 pt-8 pb-28 lg:pb-24 px-4 overflow-x-clip min-w-0',
      HeaderStart,
      Search: GlobalSearch,
      headerActions: [Online, History, Share],
      Notifications,
      AccountMenu,
    },
  };

  return (
    <DashboardProvider dashboard={dashboard}>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <Toaster position="top-right" />
      <FlashToast />
      <ConfirmHost />
      {user && <Tour user={user} autoStart={component === 'Dashboard'} />}
      <DashboardShell>{children}</DashboardShell>
    </DashboardProvider>
  );
}

/**
 * Pages drawn without the dashboard frame, as on Inertia: the sign-in pages
 * (they bring GuestLayout) and the full-screen error page. They keep
 * Najenga's styles (admin-theme on <html>).
 */
const isBare = (component) => component === 'Errors' || component?.startsWith('Auth/');

function Bare({ children }) {
  useEffect(() => {
    document.documentElement.classList.add('admin-theme');
    return () => document.documentElement.classList.remove('admin-theme');
  }, []);
  return (
    <>
      <ConfirmHost />
      {children}
    </>
  );
}

/** The frame the page asks for: the dashboard's, or none. */
function Frame({ children }) {
  const state = usePageState();
  if (!state.page) return null;
  if (isBare(state.page.component)) return <Bare>{children}</Bare>;
  return <Shell>{children}</Shell>;
}

/** The page the server named, with its props. */
function CurrentPage() {
  const state = usePageState();
  if (!state.page) return null;
  const Page = pageComponent(state.page.component);
  if (!Page) return <p className="text-gray-400">This page isn’t available here yet.</p>;
  return (
    <Suspense fallback={null}>
      <Page key={state.page.component} {...state.page.props} />
    </Suspense>
  );
}

export default function DashboardApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <InertiaBridge />
      <PageDataProvider>
        <Frame>
          <CurrentPage />
        </Frame>
      </PageDataProvider>
    </QueryClientProvider>
  );
}
