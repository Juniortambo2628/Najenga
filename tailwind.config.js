import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
        './resources/js/**/*.js',
    ],

    theme: {
        extend: {
            screens: {
                // Desktop viewports tall enough for fit-to-screen lists: the
                // page fills the viewport and only the list's rows scroll.
                fit: { raw: '(min-width: 1024px) and (min-height: 640px)' },
            },
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
                // Large, light headlines on the public pages (as Naoa's).
                display: ['Manrope', 'Figtree', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                // The dashboard's near-black surfaces, darkest to lightest:
                // page, sidebar, cards/panels, menus/dialogs.
                surface: {
                    DEFAULT: '#0b0c0d',
                    sidebar: '#101112',
                    panel: '#141516',
                    overlay: '#18191b',
                },
                brand: {
                    DEFAULT: '#8B0000',
                    light: '#DC143C',
                    dark: '#5C0000',
                },
            },
        },
    },

    plugins: [forms],
};
