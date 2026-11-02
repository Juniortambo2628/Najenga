import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.js';

/**
 * The app's own tests (test/) and Najenga's page and component tests
 * (../tests/js), with the build's aliases: '@/' is resources/js and
 * '@inertiajs/react' is the page API in src/najenga/inertia.jsx.
 */
export default mergeConfig(viteConfig({ command: 'build' }), defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['test/**/*.test.{js,jsx}', '../tests/js/**/*.{test,spec}.{js,jsx}'],
    setupFiles: ['../tests/js/setup.js'],
    // ../tests/js sits outside this app: its testing libraries must resolve
    // here (React 19), not from wherever Node would look first.
    server: { deps: { inline: [/@testing-library\//, /@okjt\//] } },
  },
  resolve: { dedupe: ['@testing-library/react', '@testing-library/jest-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime', 'react-dom/client'] },
}));
