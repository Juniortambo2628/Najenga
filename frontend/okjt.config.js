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
    // brand reds), as the kit's tokens. The tone ramp runs dark to light.
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
        accentSoft: '#5c1a24',
        line: 'rgb(255 255 255 / 0.08)',
        lineStrong: 'rgb(255 255 255 / 0.12)',
        tint: 'rgb(255 255 255 / 0.05)',
        paper: '#0b0c0d',
        paperWarm: '#101112',
        surface: '#141516',
        contrast: '#ffffff',
        positive: '#34d399',
        positiveDark: '#6ee7b7',
        tone: {
          50: '#1a1b1c',
          100: '#232425',
          200: '#2c2d2e',
          300: '#3d3e3f',
          400: '#6b6c6d',
          500: '#8a8b8c',
          600: '#a3a4a5',
          700: '#c4c5c6',
          800: '#e2e3e3',
          900: '#f2f2f2',
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
