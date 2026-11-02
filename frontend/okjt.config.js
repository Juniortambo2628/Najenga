/**
 * Najenga's theme for the OKJT kit (@okjt/ui): the colours and fonts of the
 * public pages, and the dashboard's own dark colours (theme.dashboard). src/okjt-theme.css is generated
 * from it before every `npm run dev` and `npm run build` (or: npm run theme).
 * The values are the ones Najenga's public pages already used.
 */
export default {
  theme: {
    colors: {
      ink: '#1A1514',
      inkDeep: '#140F0E',
      body: '#3A2F2C',
      soft: '#5E5450',
      muted: '#8A7B72',
      faint: '#A8998F',
      accent: '#B3122E',
      accentStrong: '#8B0000',
      accentDark: '#6E0A1E',
      accentSoft: '#D4A7A0',
      line: '#E2D9D2',
      lineStrong: '#D8CEC7',
      tint: '#F4F1EE',
      paper: '#FBF9F7',
      paperWarm: '#F4EEEA',
      positive: '#5B8A5B',
      positiveDark: '#3F6B3F',
      tone: 'stone',
    },
    // The dashboard is dark: the values its Tailwind 3 pages wrote by hand
    // (#0b0c0d page, #141516 panels, white text at falling strengths, the
    // brand reds), as the kit's tokens.
    dashboard: {
      colorScheme: 'dark',
      colors: {
        ink: '#ffffff',
        inkDeep: '#000000',
        body: '#e5e7eb',
        soft: '#9ca3af',
        muted: '#8a8b8c',
        faint: '#6b7280',
        accent: '#DC143C',
        accentStrong: '#fb7185',
        accentDark: '#fda4af',
        accentSoft: '#fecdd3',
        line: 'rgb(255 255 255 / 0.08)',
        lineStrong: 'rgb(255 255 255 / 0.12)',
        tint: 'rgb(255 255 255 / 0.05)',
        paper: '#0b0c0d',
        paperWarm: '#101112',
        // Najenga's panels: #141516 at 90% (the .panel class).
        surface: 'rgb(20 21 22 / 0.9)',
        contrast: '#ffffff',
        // Solid buttons: Najenga's deep red.
        action: '#8B0000',
        positive: '#34d399',
        positiveDark: '#6ee7b7',
        // White at rising strengths, as Najenga's pages write it: hovers
        // white/4, borders white/8 and /12, text white/40 to white.
        tone: {
          50: 'rgb(255 255 255 / 0.04)',
          100: 'rgb(255 255 255 / 0.08)',
          200: 'rgb(255 255 255 / 0.12)',
          300: 'rgb(255 255 255 / 0.2)',
          400: 'rgb(255 255 255 / 0.4)',
          500: 'rgb(255 255 255 / 0.5)',
          600: 'rgb(255 255 255 / 0.6)',
          700: 'rgb(255 255 255 / 0.75)',
          800: 'rgb(255 255 255 / 0.85)',
          900: 'rgb(255 255 255 / 0.95)',
          950: '#ffffff',
        },
      },
    },
    fonts: {
      sans: "'Figtree', ui-sans-serif, system-ui, sans-serif",
      display: "'Manrope', 'Figtree', ui-sans-serif, system-ui, sans-serif",
    },
  },
};
