import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const here = (path) => fileURLToPath(new URL(path, import.meta.url));

/**
 * Najenga's new React app (Phase 6 of moving onto the OKJT kit). Laravel
 * serves its build (copied into public/ when deployed) for the pages that
 * have moved; Inertia keeps the rest. In development it serves Laravel's
 * public/ files (photos, logos, icons) and sends everything else to Laravel.
 *
 * Dashboard pages that have moved are drawn from resources/js (shared with
 * the Inertia app until it goes): `@/` points there, @inertiajs/react is the
 * stand-in in src/najenga/inertia.jsx, and their layout is the kit's shell.
 * Their packages resolve from this app (React 19), never the root's.
 */
export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss()],
  publicDir: command === 'serve' ? '../public' : false,
  resolve: {
    alias: [
      { find: '@inertiajs/react', replacement: here('./src/najenga/inertia.jsx') },
      { find: '@/Layouts/AuthenticatedLayout', replacement: here('./src/najenga/AuthenticatedLayout.jsx') },
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
