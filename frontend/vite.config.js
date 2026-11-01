import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * Najenga's new React app (Phase 6 of moving onto the OKJT kit). Laravel
 * serves its build (copied into public/ when deployed) for the pages that
 * have moved; Inertia keeps the rest. In development it serves Laravel's
 * public/ files (photos, logos, icons) and sends everything else to Laravel.
 */
export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss()],
  publicDir: command === 'serve' ? '../public' : false,
  build: { outDir: 'dist', assetsDir: 'app-assets' },
  server: {
    port: 5174,
    proxy: { '/api': { target: 'http://127.0.0.1:8000', changeOrigin: true } },
  },
}));
