import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
    ],
    build: {
        // vendor-ag-grid is the only chunk left over 500 kB. AG Grid 36
        // ships a single ESM bundle, so Rollup cannot split it further;
        // ExpenseSheet - which used to swallow all 1.6 MB of it - is now
        // 30 kB and still sits behind a lazy() import.
        chunkSizeWarningLimit: 1200,
        rollupOptions: {
            output: {
                // Keep the heavy single-purpose libraries out of the page
                // chunks; ExpenseSheet bundled ag-grid + xlsx alone and
                // crossed the 500 kB warning on every build.
                manualChunks(id) {
                    if (!id.includes('node_modules')) return;
                    if (/node_modules\/(ag-grid-community|ag-grid-react)\//.test(id)) return 'vendor-ag-grid';
                    if (/node_modules\/xlsx\//.test(id)) return 'vendor-xlsx';
                    if (/node_modules\/pdfjs-dist\//.test(id)) return 'vendor-pdfjs';
                    if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) return 'vendor-react';
                    if (/node_modules\/@inertiajs\//.test(id)) return 'vendor-inertia';
                },
            },
        },
    },
    server: {
        port: 5176,
        hmr: {
            host: 'localhost',
            port: 5176,
        },
    },
});
