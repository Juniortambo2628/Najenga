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
    build: {
        sourcemap: 'hidden',
        chunkSizeWarningLimit: 800,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (!id.includes('node_modules')) return;
                    if (id.includes('ag-grid')) return 'aggrid';
                    if (id.includes('xlsx')) return 'xlsx';
                    if (id.includes('tesseract.js')) return 'tesseract';
                    if (id.includes('react-pdf') || id.includes('pdfjs-dist')) return 'pdf';
                    if (id.includes('framer-motion')) return 'motion';
                    if (id.includes('swiper')) return 'swiper';
                    if (id.includes('@annotorious')) return 'annotorious';
                    if (id.includes('react-chat-elements') || id.includes('react-mentions')) return 'chat';
                    if (id.includes('date-fns')) return 'datefns';
                    if (id.includes('browser-image-compression')) return 'imgcompress';
                    // React, react-dom, scheduler, Inertia and the other shared libs stay in
                    // one chunk. Splitting React into its own chunk created a circular import
                    // (react-core <-> vendor <-> inertia), so vendor could evaluate before
                    // React was initialised and crash on `React.memo` at load time.
                    return 'vendor';
                },
            },
        },
    },
});
