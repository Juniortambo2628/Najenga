import { createElement, useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { pageKey, usePageState } from '../dashboard/page';
import { request } from '../dashboard/api';

/**
 * What Najenga's pages used from @inertiajs/react (Link, router, useForm,
 * usePage, Head), on react-router and the page-data bridge
 * (App\Http\Middleware\ServeKitPages), so a page moves to the kit app with
 * its code nearly as it was. Requests speak Inertia's protocol to Laravel, so
 * controllers, redirects, flash messages and validation errors behave exactly
 * as they did. A visit to a page that hasn't moved yet reloads into it.
 *
 * Goes away with Inertia (Phase 6c), as pages switch to the kit's own pieces.
 */

const bridge = { navigate: null, queryClient: null };
const events = new EventTarget();

/** Lets router.* reach react-router and the query cache (rendered once, in DashboardApp). */
export function InertiaBridge() {
  bridge.navigate = useNavigate();
  bridge.queryClient = useQueryClient();
  return null;
}

function fire(type, visit, extra = {}) {
  const event = new CustomEvent(type, { cancelable: type === 'before', detail: { visit, ...extra } });
  return events.dispatchEvent(event);
}

const hasFiles = (data) => data && Object.values(data).some((v) => v instanceof Blob || (Array.isArray(v) && v.some((x) => x instanceof Blob)) || (v && typeof v === 'object' && !(v instanceof Blob) && !Array.isArray(v) && hasFiles(v)));

function toFormData(data, form = new FormData(), prefix = '') {
  for (const [key, value] of Object.entries(data ?? {})) {
    const name = prefix ? `${prefix}[${key}]` : key;
    if (value === undefined) continue;
    if (value === null) form.append(name, '');
    else if (value instanceof Blob) form.append(name, value);
    else if (Array.isArray(value)) value.forEach((item, i) => (item instanceof Blob ? form.append(`${name}[]`, item) : typeof item === 'object' && item !== null ? toFormData(item, form, `${name}[${i}]`) : form.append(`${name}[]`, item)));
    else if (typeof value === 'object') toFormData(value, form, name);
    else if (typeof value === 'boolean') form.append(name, value ? '1' : '0');
    else form.append(name, value);
  }
  return form;
}

const relative = (url) => {
  const u = new URL(url, window.location.origin);
  return u.origin === window.location.origin ? u.pathname + u.search + u.hash : u.href;
};

/** The heart of it: one visit, Inertia-style. */
async function visit(href, options = {}) {
  const method = (options.method || 'get').toLowerCase();
  let url = relative(href);
  let data = options.data ?? {};
  if (method === 'get' && data && Object.keys(data).length) {
    const u = new URL(url, window.location.origin);
    for (const [k, v] of Object.entries(data)) if (v != null && v !== '') u.searchParams.set(k, v);
    url = u.pathname + u.search;
    data = {};
  }
  const details = { url, method, data, only: options.only ?? [], preserveScroll: options.preserveScroll, preserveState: options.preserveState };

  if (options.onBefore?.(details) === false || !fire('before', details)) return;
  fire('start', details);
  options.onStart?.(details);

  try {
    let page;
    if (method === 'get') {
      page = await bridge.queryClient.fetchQuery({ queryKey: pageKey(url), queryFn: () => fetchVisit('GET', url), staleTime: 0 });
    } else {
      page = await fetchVisit(method.toUpperCase(), url, data);
    }
    if (!page) return; // reloading into a page that hasn't moved
    const target = relative(page.url);
    bridge.queryClient.setQueryData(pageKey(target), page);
    const current = window.location.pathname + window.location.search;
    if (target !== current || method === 'get') {
      bridge.navigate(target + (method === 'get' ? new URL(url, window.location.origin).hash : ''), { replace: Boolean(options.replace) });
      fire('navigate', details, { page });
    }
    if (!options.preserveScroll && method === 'get' && target !== current) window.scrollTo(0, 0);

    const errors = page.props?.errors ?? {};
    if (Object.keys(errors).length) {
      fire('error', details, { errors });
      options.onError?.(errors);
    } else {
      fire('success', details, { page });
      options.onSuccess?.(page);
    }
  } catch (error) {
    fire('exception', details, { error });
    if (options.onError) options.onError({ message: error.message });
    else throw error;
  } finally {
    fire('finish', details);
    options.onFinish?.(details);
  }
}

/** A request with Inertia's headers; follows redirects; resolves to the page object. */
async function fetchVisit(method, url, data) {
  const send = method !== 'GET';
  const files = send && hasFiles(data);
  // Laravel reads PUT/PATCH/DELETE uploads only as a spoofed POST.
  const realMethod = files && method !== 'POST' ? 'POST' : method;
  const body = !send ? undefined : files ? toFormData({ ...data, ...(method !== 'POST' ? { _method: method } : {}) }) : data;
  try {
    const { data: page } = await request(realMethod, url, {
      data: body,
      headers: { 'X-Inertia': 'true', 'X-Kit-Page': '1', Accept: 'text/html, application/xhtml+xml' },
    });
    if (page?.component) return page;
    window.location.assign(url);
    return null;
  } catch (error) {
    const location = error.response?.status === 409 && error.location;
    if (location) {
      window.location.assign(location);
      return null;
    }
    throw error;
  }
}

export const router = {
  visit,
  get: (url, data = {}, options = {}) => visit(url, { ...options, method: 'get', data }),
  post: (url, data = {}, options = {}) => visit(url, { ...options, method: 'post', data }),
  put: (url, data = {}, options = {}) => visit(url, { ...options, method: 'put', data }),
  patch: (url, data = {}, options = {}) => visit(url, { ...options, method: 'patch', data }),
  delete: (url, options = {}) => visit(url, { ...options, method: 'delete' }),
  reload: (options = {}) => visit(window.location.pathname + window.location.search, { preserveScroll: true, preserveState: true, ...options, method: 'get' }),
  on: (type, callback) => {
    const listener = (event) => {
      if (callback(event) === false) event.preventDefault();
    };
    events.addEventListener(type, listener);
    return () => events.removeEventListener(type, listener);
  },
};

/** { props, url, component }: the page's props with the shared ones. */
export function usePage() {
  const state = usePageState();
  const page = state?.ready ? state.page : null;
  return {
    props: { ...(state?.shared ?? {}), errors: {}, ...(page?.props ?? {}) },
    url: page?.url ?? (typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/'),
    component: page?.component ?? null,
  };
}

export function Head({ title }) {
  useEffect(() => {
    if (title) document.title = `${title} - Najenga`;
  }, [title]);
  return null;
}

export function Link({ href, method = 'get', as, data, preserveScroll, preserveState, replace, only, onClick, children, ...rest }) {
  const go = (e) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    if (method === 'get' && (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0)) return;
    e.preventDefault();
    visit(href, { method, data, preserveScroll, preserveState, replace, only });
  };
  const tag = as || (method === 'get' ? 'a' : 'button');
  return createElement(tag, { ...(tag === 'a' ? { href } : { type: 'button' }), onClick: go, ...rest }, children);
}

/** Inertia's form helper: data, errors, processing and the verbs. */
export function useForm(initial = {}) {
  const defaults = useRef(typeof initial === 'function' ? initial() : initial);
  const [data, setDataState] = useState(defaults.current);
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);
  const [recentlySuccessful, setRecentlySuccessful] = useState(false);
  const [wasSuccessful, setWasSuccessful] = useState(false);
  const transformer = useRef((d) => d);
  const latest = useRef(data);
  latest.current = data;

  const setData = useCallback((key, value) => {
    if (typeof key === 'string') setDataState((d) => ({ ...d, [key]: value }));
    else if (typeof key === 'function') setDataState((d) => key(d));
    else setDataState(key);
  }, []);

  const submit = useCallback((method, url, options = {}) => {
    const payload = transformer.current(latest.current);
    return visit(url, {
      ...options,
      method,
      data: payload,
      onStart: (v) => { setProcessing(true); setWasSuccessful(false); options.onStart?.(v); },
      onSuccess: (page) => {
        setErrors({});
        setWasSuccessful(true);
        setRecentlySuccessful(true);
        setTimeout(() => setRecentlySuccessful(false), 2000);
        options.onSuccess?.(page);
      },
      onError: (errs) => { setErrors(errs); options.onError?.(errs); },
      onFinish: (v) => { setProcessing(false); options.onFinish?.(v); },
    });
  }, []);

  const isDirty = JSON.stringify(data) !== JSON.stringify(defaults.current);

  return {
    data,
    setData,
    errors,
    hasErrors: Object.keys(errors).length > 0,
    processing,
    progress: null,
    wasSuccessful,
    recentlySuccessful,
    isDirty,
    transform: (fn) => { transformer.current = fn; },
    setDefaults: (key, value) => {
      if (key === undefined) defaults.current = latest.current;
      else if (typeof key === 'string') defaults.current = { ...defaults.current, [key]: value };
      else defaults.current = { ...defaults.current, ...key };
    },
    reset: (...fields) => {
      if (!fields.length) setDataState(defaults.current);
      else setDataState((d) => ({ ...d, ...Object.fromEntries(fields.map((f) => [f, defaults.current[f]])) }));
    },
    clearErrors: (...fields) => setErrors((e) => (fields.length ? Object.fromEntries(Object.entries(e).filter(([k]) => !fields.includes(k))) : {})),
    setError: (key, value) => setErrors((e) => (typeof key === 'string' ? { ...e, [key]: value } : { ...e, ...key })),
    submit,
    get: (url, options) => submit('get', url, options),
    post: (url, options) => submit('post', url, options),
    put: (url, options) => submit('put', url, options),
    patch: (url, options) => submit('patch', url, options),
    delete: (url, options) => submit('delete', url, options),
  };
}
