import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./tests/js/setup.js'],
        include: ['tests/js/**/*.{test,spec}.{js,jsx}'],
    },
    resolve: {
        alias: {
            '@': '/resources/js',
        },
    },
});
