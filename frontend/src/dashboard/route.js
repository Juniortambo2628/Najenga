import ROUTES from './routes.json';

/**
 * Laravel's named routes as paths, like Ziggy's route() on the Inertia
 * pages: route('expenses.show', 12), route('projects.members.update', [p, u]),
 * route('search', { q: 'cement' }). A model passes its id; parameters the
 * route doesn't take become the query string. The list is
 * routes.json (php artisan najenga:kit-routes).
 */
export function route(name, params = {}) {
  const uri = ROUTES[name];
  if (!uri) throw new Error(`route(): no route named '${name}'`);

  const names = [...uri.matchAll(/\{(\w+)\??\}/g)].map((m) => m[1]);
  const value = (v) => (v && typeof v === 'object' && 'id' in v ? v.id : v);
  let rest = {};
  let given = {};
  if (Array.isArray(params)) {
    names.forEach((n, i) => { given[n] = params[i]; });
  } else if (params !== null && typeof params === 'object' && !('id' in params)) {
    given = { ...params };
  } else if (names.length) {
    given[names[0]] = params;
  }

  let path = uri;
  for (const n of names) {
    const v = value(given[n]);
    path = path.replace(new RegExp(`\\{${n}\\??\\}`), v == null ? '' : encodeURIComponent(v));
    delete given[n];
  }
  rest = Object.fromEntries(Object.entries(given).filter(([, v]) => v != null && v !== ''));
  path = path.replace(/\/+$/, '') || '/';
  const query = new URLSearchParams(rest).toString();
  return query ? `${path}?${query}` : path;
}

export const hasRoute = (name) => name in ROUTES;
