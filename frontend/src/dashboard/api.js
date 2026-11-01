/**
 * Talking to Laravel from the kit app. Same origin, Laravel's session cookie
 * (sign-in is still on the Inertia pages), and its XSRF-TOKEN cookie sent
 * back as X-XSRF-TOKEN for anything that changes data.
 *
 * Calls resolve to { data, status } (axios-like, as the kit expects) and
 * reject with an Error carrying `status` and `response.data` (Laravel's
 * { message, errors } for a 422).
 */
function xsrfToken() {
  const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export async function request(method, url, { data, params, headers = {} } = {}) {
  const query = params ? `?${new URLSearchParams(Object.entries(params).filter(([, v]) => v != null && v !== ''))}` : '';
  const isForm = typeof FormData !== 'undefined' && data instanceof FormData;
  const token = method === 'GET' ? null : xsrfToken();
  const res = await fetch(url + query, {
    method,
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...(data !== undefined && !isForm ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { 'X-XSRF-TOKEN': token } : {}),
      ...headers,
    },
    body: data === undefined ? undefined : isForm ? data : JSON.stringify(data),
  });
  const body = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) {
    const error = new Error(body?.message || `Request failed (${res.status})`);
    error.status = res.status;
    error.response = { status: res.status, data: body };
    // Inertia's "reload into this page" answer (a page that hasn't moved).
    error.location = res.headers.get('X-Inertia-Location');
    if (res.status === 401 || res.status === 419) window.location.assign('/login');
    throw error;
  }
  return { data: body, status: res.status };
}

export const http = {
  get: (url, config) => request('GET', url, config),
  post: (url, data, config) => request('POST', url, { ...config, data }),
  put: (url, data, config) => request('PUT', url, { ...config, data }),
  patch: (url, data, config) => request('PATCH', url, { ...config, data }),
  delete: (url, config) => request('DELETE', url, config),
};

/**
 * A page's data: the props its controller gives Inertia
 * (App\Http\Middleware\ServeKitPages). A page that hasn't moved to the kit
 * app answers with HTML instead: load it as a page of its own.
 */
export async function fetchPage(url) {
  let data;
  try {
    // Accept as Inertia sends it: some controllers answer JSON callers differently.
    ({ data } = await request('GET', url, { headers: { 'X-Kit-Page': '1', Accept: 'text/html, application/xhtml+xml' } }));
  } catch (error) {
    // A 403/404 comes back as Najenga's Errors page; a page that hasn't moved, as a reload.
    if (error.response?.data?.component) return error.response.data;
    if (error.location) {
      window.location.assign(error.location);
      return new Promise(() => {});
    }
    throw error;
  }
  if (!data?.component) {
    window.location.assign(url);
    return new Promise(() => {});
  }
  return data;
}
