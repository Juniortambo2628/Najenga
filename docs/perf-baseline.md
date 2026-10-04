# Performance / size baseline

Captured in Phase 0 of the refactor, before any change. Re-run and update the
"After" column after each phase.

**Commands**

```powershell
npm run build        # size table
npm run test:js      # JS suite
php artisan test     # PHP suite
```

## Correctness baseline

| Suite | Result |
|---|---|
| `php artisan test` | **290 passed** (436 assertions) — 61–66s |
| `npm run test:js` | **37 passed** (5 files) |
| `npm run build` | succeeds, 24.05s |

## Bundle

| Metric | Before |
|---|---|
| Built asset files | **88** |
| Built asset total | **3,476,926 bytes (3.32 MB)** |
| Manifest entries | **85** |
| **Page entries in manifest** | **46** — every page ships its own parse-blocking entry in `<head>` |
| Largest chunk | `ExpenseSheet-*.js` **1,624.03 kB** (gzip 478.97 kB) |
| 2nd largest | `Documents-*.js` **442.05 kB** (gzip 129.91 kB) — react-pdf |
| App entry | `app-*.js` **340.68 kB** (gzip 113.95 kB) |
| Build warning | `Some chunks are larger than 500 kB` |

## Static assets

| Asset | Before | Target |
|---|---|---|
| `public/Najenga-logos/Najenga-favicon.png` | **1,675,234 bytes (1.60 MB)** | < 5 KB |
| `public/Najenga-logos/Najenga-Logo-header-footer-logo-transparent.png` | 274,604 bytes, rendered at 40×40 px | sized variant |
| `public/Najenga-backgrounds/` | **16 files, 37,007,432 bytes (35.3 MB)** | WebP + lazy, < 4 MB first paint |
| `<img>` tags with `loading="lazy"` | **1 of 18** | all non-hero images |

## Render-blocking third-party resources in `<head>`

| Resource | File |
|---|---|
| `fonts.bunny.net/css?family=figtree:400,500,600` (missing weight 700; `font-bold` used 117×) | `resources/views/app.blade.php:14` |
| `cdnjs.cloudflare.com … font-awesome/6.5.1/css/all.min.css` (~100 KB full set) | `resources/views/app.blade.php:17` |
| pdf.js worker fetched from `unpkg.com` (local copy unused) | `resources/js/Pages/Documents.jsx:25` |

Target: **0 third-party render-blocking stylesheets.**

## Definition of done — targets

| Metric | Before | Target |
|---|---|---|
| Favicon | 1,675,234 B | < 5 KB |
| Blocking third-party stylesheets | 2 | 0 |
| Page entries parsed in `<head>` | 46 | 1 shared entry + modulepreload |
| Landing/auth background payload | 35.3 MB | lazy, WebP, < 4 MB first paint |
| Duplicated `.panel` markup | 31 copies / 10 files | 0 |
| Breadcrumb + nav definitions | 2 | 1 (`NAV` config) |
| Tables MyISAM / enforced FKs | 24 / 0 | 0 / all declared FKs |
| PHP suite | 290 pass | 290+ pass (never fewer) |
| JS suite | 37 pass | 37+ pass (never fewer) |
