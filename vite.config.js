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
