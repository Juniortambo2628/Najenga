import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchPage, http } from '../src/dashboard/api';

const respond = (status, body, headers = {}) => vi.fn(async () => new Response(body === null ? null : JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...headers } }));

afterEach(() => { vi.restoreAllMocks(); document.cookie = 'XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 GMT'; });

describe('the API client', () => {
  it('sends the XSRF cookie back on writes, not reads', async () => {
    document.cookie = 'XSRF-TOKEN=abc%3D';
    globalThis.fetch = respond(200, { ok: true });
    await http.get('/x', { params: { a: 1, b: null } });
    expect(fetch.mock.calls[0][0]).toBe('/x?a=1');
    expect(fetch.mock.calls[0][1].headers['X-XSRF-TOKEN']).toBeUndefined();
    await http.post('/x', { name: 'A' });
    const [, init] = fetch.mock.calls[1];
    expect(init.headers['X-XSRF-TOKEN']).toBe('abc=');
    expect(init.body).toBe('{"name":"A"}');
  });

  it("rejects with Laravel's errors", async () => {
    globalThis.fetch = respond(422, { message: 'The title field is required.', errors: { title: ['Required'] } });
    await expect(http.post('/expenses', {})).rejects.toMatchObject({ status: 422, response: { data: { errors: { title: ['Required'] } } } });
  });
});

describe('fetchPage()', () => {
  it("returns the page's Inertia object, asked for as Inertia asks", async () => {
    globalThis.fetch = respond(200, { component: 'Expenses', props: { a: 1 }, url: '/expenses' });
    expect(await fetchPage('/expenses')).toMatchObject({ component: 'Expenses' });
    const headers = fetch.mock.calls[0][1].headers;
    expect(headers['X-Kit-Page']).toBe('1');
    expect(headers.Accept).toBe('text/html, application/xhtml+xml');
  });

  it("returns Najenga's error page for a 404", async () => {
    globalThis.fetch = respond(404, { component: 'Errors', props: { status: 404 }, url: '/expenses/9' });
    expect(await fetchPage('/expenses/9')).toMatchObject({ component: 'Errors', props: { status: 404 } });
  });

  it("reloads into a page that hasn't moved", async () => {
    const assign = vi.fn();
    vi.stubGlobal('location', { ...window.location, assign, origin: 'http://localhost' });
    globalThis.fetch = vi.fn(async () => new Response('<html></html>', { status: 200, headers: { 'Content-Type': 'text/html' } }));
    fetchPage('/photos');
    await new Promise((r) => setTimeout(r, 10));
    expect(assign).toHaveBeenCalledWith('/photos');
    vi.unstubAllGlobals();
  });
});
