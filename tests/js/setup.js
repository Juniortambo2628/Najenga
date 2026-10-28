import '@testing-library/jest-dom';
import './routeStub';

// jsdom has no ResizeObserver; Headless UI's anchored menus (floating-ui) need one.
globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
};
