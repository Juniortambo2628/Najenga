import { describe, expect, it } from 'vitest';
import { route, hasRoute } from '../src/dashboard/route';

describe('route()', () => {
  it('gives the path of a named route', () => {
    expect(route('expenses')).toBe('/expenses');
    expect(route('dashboard')).toBe('/dashboard');
  });

  it('fills parameters from a value, a model, an array or an object', () => {
    expect(route('expenses.show', 12)).toBe('/expenses/12');
    expect(route('expenses.show', { id: 7, title: 'Cement' })).toBe('/expenses/7');
    expect(route('projects.members.update', [3, { id: 9 }])).toBe('/projects/3/members/9');
    expect(route('expenses.show', { expense: 5 })).toBe('/expenses/5');
  });

  it('puts what the route does not take in the query string', () => {
    expect(route('search', { q: 'cement bags' })).toBe('/search?q=cement+bags');
    expect(route('expenses', { project: 2, empty: '' })).toBe('/expenses?project=2');
  });

  it('fails loudly for a name that does not exist', () => {
    expect(hasRoute('expenses')).toBe(true);
    expect(() => route('nope.nothing')).toThrow(/no route named 'nope.nothing'/);
  });
});
