import { createContext, useContext, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchPage } from './api';

/**
 * Each page's data, fetched from the URL the page is at: the props its
 * Laravel controller hands Inertia today (see ServeKitPages), including the
 * shared ones (auth.user, auth.projects, flash). The shell keeps the last
 * shared props while the next page loads, so the frame never blinks.
 */
const PageContext = createContext(null);

export const pageKey = (url) => ['page', url];

/**
 * The page Laravel sent inside index.html (ServeKitPages), for the URL the
 * browser opened: the app starts from it instead of asking again.
 */
export function seedFirstPage(queryClient) {
  const el = typeof document !== 'undefined' && document.getElementById('kit-page');
  if (!el) return;
  try {
    const page = JSON.parse(el.textContent);
    queryClient.setQueryData(pageKey(window.location.pathname + window.location.search), page);
  } catch {
    // Unreadable: the app asks for the page instead.
  }
  el.remove();
}

export function PageDataProvider({ children }) {
  const { pathname, search } = useLocation();
  const url = pathname + search;
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const query = useQuery({ queryKey: pageKey(url), queryFn: () => fetchPage(url), placeholderData: keepPreviousData, staleTime: 2000 });
  const shared = useRef({ auth: {}, flash: {} });
  if (query.data?.props) {
    const { auth, flash } = query.data.props;
    shared.current = { auth: auth ?? {}, flash: flash ?? {} };
  }

  // The server redirected (e.g. /projects to /overview): show where we ended up.
  const landed = query.data && !query.isPlaceholderData ? new URL(query.data.url, window.location.origin) : null;
  const landedUrl = landed ? landed.pathname + landed.search : null;
  useEffect(() => {
    if (landedUrl && landedUrl !== url) {
      queryClient.setQueryData(pageKey(landedUrl), query.data);
      navigate(landedUrl + window.location.hash, { replace: true });
    }
  }, [landedUrl, url, navigate, queryClient, query.data]);

  const value = useMemo(() => ({
    url,
    page: query.data,
    // The data is for this URL (not the last page's, kept while loading).
    ready: Boolean(query.data) && !query.isPlaceholderData,
    error: query.error,
    shared: shared.current,
    reload: () => queryClient.invalidateQueries({ queryKey: ['page'] }),
  }), [url, query.data, query.isPlaceholderData, query.error, queryClient]);

  return <PageContext.Provider value={value}>{children}</PageContext.Provider>;
}

const usePage = () => useContext(PageContext);

/** This page's props, or null while they load. */
export function usePageProps() {
  const page = usePage();
  return page.ready ? page.page.props : null;
}

/** auth (user, projects) and flash, from the latest page. */
export function useShared() {
  return usePage()?.shared ?? { auth: {}, flash: {} };
}

/** Load this page's (and every cached page's) data again, e.g. after a save. */
export function useReloadPage() {
  return usePage().reload;
}

export function usePageState() {
  return usePage();
}
