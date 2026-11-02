import '@testing-library/jest-dom';
import './routeStub';

// jsdom has no ResizeObserver; Headless UI's anchored menus (floating-ui) need one.
globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
};

// Pages are tested without a router: the kit's links (react-router's Link)
// render as plain links, as the page API's Link does in these tests.
vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal();
    const { createElement } = await import('react');
    return { ...actual, Link: ({ to, children, ...rest }) => createElement('a', { href: to, ...rest }, children) };
});
