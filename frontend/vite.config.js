import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const here = (path) => fileURLToPath(new URL(path, import.meta.url));

/**
 * resources/js and tests/js live outside this app: their packages
 * ('react-dropzone', 'axios'…) resolve from here, as if this app imported
 * them, so there is one copy of each (React 19) and no node_modules above.
 */
function packagesFromThisApp() {
  const outside = [here('../resources/js/'), here('../tests/js/')];
  const entry = here('./src/main.jsx');
  return {
    name: 'najenga:packages-from-this-app',
    enforce: 'pre',
    async resolveId(source, importer, options) {
      if (!importer || !outside.some((dir) => importer.startsWith(dir))) return null;
      if (/^[./\0]|^@\//.test(source) || source.startsWith('/')) return null;
      return this.resolve(source, entry, { ...options, skipSelf: true });
    },
  };
}

/**
 * Najenga's React app, on the OKJT kit: the public pages, sign-in and the
 * dashboard. Laravel serves its build (copied into public/ when deployed)
 * with each page's data inside (App\Http\Page). In development it serves
 * Laravel's public/ files (photos, logos, icons) and sends /api to Laravel.
 *
 * Najenga's pages and components are in resources/js: `@/` points there,
 * and '@inertiajs/react' (the name their page API had) is
 * src/najenga/inertia.jsx. Their packages resolve from this app.
 */
export default defineConfig(({ command }) => ({
  plugins: [packagesFromThisApp(), react(), tailwindcss()],
  publicDir: command === 'serve' ? '../public' : false,
  resolve: {
    alias: [
      { find: '@inertiajs/react', replacement: here('./src/najenga/inertia.jsx') },
      { find: /^@\//, replacement: `${here('../resources/js')}/` },
    ],
    dedupe: ['react', 'react-dom', 'react-router-dom', 'framer-motion', '@headlessui/react', 'axios', 'date-fns', 'react-hot-toast', '@tanstack/react-query', 'lucide-react'],
  },
  build: { outDir: 'dist', assetsDir: 'app-assets' },
  server: {
    port: 5174,
    fs: { allow: [here('..')] },
    proxy: { '/api': { target: 'http://127.0.0.1:8000', changeOrigin: true } },
  },
}));
