# Performance / size baseline

Captured in Phase 0 of the refactor, before any change. The "After (Phase 1)"
column was re-measured after Phase 1 commits `e4141b0`..`923ece9`.

**Commands**

```powershell
npm run build        # size table
npm run test:js      # JS suite
php artisan test     # PHP suite
```

## Correctness baseline

| Suite | Before | After (Phase 1) |
|---|---|---|
| `php artisan test` | **290 passed** (436 assertions) — 61–66s | **295 passed** (459 assertions) — ~40s |
| `npm run test:js` | **37 passed** (5 files) | **71 passed** (10 files) |
| `npm run build` | succeeds, 24.05s | succeeds, ~17s |

## Bundle

| Metric | Before | After (Phase 1) |
|---|---|---|
| Built asset files | **88** | 90 |
| Built asset total | **3,476,926 bytes (3.32 MB)** | 3,473,740 bytes (3.31 MB) |
| Manifest entries | **85** | 85 |
| **Module scripts parsed in `<head>`** | **46** — every page shipped its own parse-blocking entry | **1** — `app.jsx` only; laravel-vite-plugin prefetches the other 84 at `fetchpriority=low` after `load` |
| Largest chunk | `ExpenseSheet-*.js` **1,624.03 kB** (gzip 478.97 kB) | `ExpenseSheet-*.js` 1,624.03 kB (unchanged, still open) |
| 2nd largest | `Documents-*.js` **442.05 kB** (gzip 129.91 kB) — react-pdf | 442.00 kB (unchanged) |
| App entry | `app-*.js` **340.68 kB** (gzip 113.95 kB) | `app-*.js` 340.76 kB + `app-*.css` 95.32 kB |
| Build warning | `Some chunks are larger than 500 kB` | still present — see open items |

## Static assets

| Asset | Before | Target | After (Phase 1) |
|---|---|---|---|
| Favicon | `Najenga-favicon.png` **1,675,234 bytes (1.60 MB)** | < 5 KB | `/favicon-32.png` **1,579 bytes** (`48`/`192` variants too) |
| Header logo | 274,604 B PNG @ 2000×2000, rendered at 40×40 px | sized variant | **19,762 B WebP @ 512×512** |
| `public/Najenga-backgrounds/` | **16 files, 37,007,432 bytes (35.3 MB)** | WebP + lazy, < 4 MB first paint | **14 WebP files, 5,861,074 bytes (5.59 MB)** served, capped at 2560 px, q82 (−82%) |
| `<img>` tags with `loading="lazy"` | **1 of 18** | all non-hero images | **18 of 25** — the 7 hero/header images stay eager |

Originals (`.jpg` / `.png`) are still on disk pending the deletion decision in
`docs/dead-files.md`; they are no longer referenced by any code.

## Render-blocking third-party resources in `<head>`

| Resource | File | After (Phase 1) |
|---|---|---|
| `fonts.bunny.net/css?family=figtree:400,500,600,700` | `resources/views/app.blade.php` | **non-blocking** — `media="print"` + `onload` swap, `<noscript>` fallback, `preconnect` kept |
| `cdnjs.cloudflare.com … font-awesome/6.5.1/css/all.min.css` (~100 KB) | `resources/views/app.blade.php` | **non-blocking** — same pattern, SRI intact |
| pdf.js worker from `unpkg.com` | `resources/js/Pages/Documents.jsx:26` | **local** — `/js/pdf.worker.min.mjs` (was already in `public/js`, unused) |

Target: **0 third-party render-blocking stylesheets — met.**

## Definition of done — targets

| Metric | Before | Target | After (Phase 1) |
|---|---|---|---|
| Favicon | 1,675,234 B | < 5 KB | ✅ 1,579 B |
| Blocking third-party stylesheets | 2 | 0 | ✅ 0 |
| Page entries parsed in `<head>` | 46 | 1 shared entry + modulepreload | ✅ 1 |
| Landing/auth background payload | 35.3 MB | lazy, WebP, < 4 MB first paint | ✅ 5.59 MB WebP + lazy (⚠ originals still on disk) |
| Duplicated `.panel` markup | 31 copies / 10 files | 0 | ✅ 0 (32 × `.panel` class) |
| Breadcrumb + nav definitions | 2 | 1 (`NAV` config) | ✅ 1 (`Config/navigation.js`) |
| Tables MyISAM / enforced FKs | 24 / 0 | 0 / all declared FKs | ⬜ Phase 4 |
| PHP suite | 290 pass | 290+ pass (never fewer) | ✅ 295 |
| JS suite | 37 pass | 37+ pass (never fewer) | ✅ 71 |

## Open items carried forward

1. `ExpenseSheet-*.js` 1.62 MB and `Documents-*.js` 442 kB — the 500 kB build
   warning. Neither is on the Phase 1 list; candidate for a later code-split.
2. `.env` has `APP_NAME=Laravel` while `.env.example` has `Najenga`, so every
   document title reads `… - Laravel`. Environment file, operator's call.
3. Dead-file deletion decision — see `docs/dead-files.md` (~39.2 MB).
