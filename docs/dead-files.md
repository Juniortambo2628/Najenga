# Dead file audit

Produced in Phase 1 to satisfy the ground rule *"prove 'unused' with listed
greps + confidence"*.

**Status:** the source + legacy-icon group was ticked for deletion and has
been removed (1,897,365 bytes). The image originals remain on disk until
Phase 5, as were the `test_ocr*.php` scripts.

## Method

Corpus = 368 text files (`*.php`, `*.jsx`, `*.js`, `*.blade.php`, `*.css`,
`*.md`, `*.example`, `*.htaccess`) excluding `node_modules/`, `vendor/`,
`storage/framework/`, `public/build/` and `.git/`.

For each candidate the **extension-less base name** is searched, because
imports in this repo omit the extension (`@/Components/ResourceFormPage`, not
`ResourceFormPage.jsx`). Searching for `Foo.jsx` alone produces false
"unreferenced" verdicts - that mistake was caught and re-run.

Self-references are excluded.

Reproduce:

```powershell
$corpus = Get-ChildItem -Recurse -File -Include *.php,*.jsx,*.js,*.blade.php,*.css,*.md `
  | Where-Object { $_.FullName -notmatch '\\node_modules\\|\\vendor\\|\\public\\build\\|\\\.git\\' }
# then: $text[$k].Contains($baseName) for each candidate
```

## Candidates

| File | Size | Refs | Evidence | Confidence | Status |
|---|---|---|---|---|---|
| `resources/js/Components/IndexPageLayout.jsx` | 4,541 B | 0 | no `IndexPageLayout` anywhere in corpus; its only JSX child (`AuthenticatedLayout`) is used directly | **High** | **DELETED** |
| `resources/js/Components/PageHeader.jsx` | 997 B | 0 | no `PageHeader` in corpus | **High** | **DELETED** |
| `resources/js/Components/FileUploadZone.jsx` | 1,373 B | 0 | no `FileUploadZone` in corpus; `FileUploadModal` builds its own dropzone | **High** | **DELETED** |
| `public/favicon.ico` | 0 B | 0 | no `favicon.ico` string anywhere except this doc; `app.blade.php` links `favicon-32/48/192.png` | **High** (0-byte anyway) | **DELETED** |
| `public/favicon-512.png` | 100,238 B | 0 | no `favicon-512` in corpus; no `manifest.webmanifest` exists | **High** | **DELETED** |
| `public/Najenga-logos/Najenga-favicon.png` | 1,675,234 B | 1 | only hit is `docs/perf-baseline.md`, which lists it as a target | **High** | **DELETED** |
| `public/images/OKJTechLogo-White_Transparent.png` | 114,982 B | 0 | no `OKJTechLogo` in corpus | **High** | **DELETED** |
| `public/test_ocr.php` | 1,643 B | 0 | no `test_ocr` in corpus | **High** | deferred to Phase 5 |
| `public/test_ocr_v2.php` | 1,087 B | 0 | no `test_ocr` in corpus | **High** | deferred to Phase 5 |
| 16 `public/Najenga-backgrounds/*.jpg` | 37,007,432 B | 1 each | superseded by `.webp` in commit `ece3510`; only hits are `docs/*.md` | **High** | deferred to Phase 5 |
| `public/Najenga-logos/Najenga-Logo-header-footer-logo-transparent.png` | 274,604 B | 1 | superseded by `.webp` in `ece3510`; only hit is `docs/perf-baseline.md` | **High** | deferred to Phase 5 |

Deleted total: **1,897,365 bytes**. Remaining reclaimable at Phase 5: **~37.4 MB**
(37.0 MB backgrounds + 275 KB logo + 2.7 KB test scripts).

Post-deletion verification: build + `npm run test:js` (71) + `php artisan test`
(295) all pass; the four deleted public assets return **404** and the five
kept assets return **200** against the live Apache instance.

### Deleted by Phase 2.7H (commit c65340c)

Decision 8 merged `/home` into `/dashboard` (dashboard wins), which
made these dead outright rather than merely unreferenced. They were
listed under *Explicitly NOT dead* above precisely because they were
still live at audit time - they were not on the Phase 5 list and are
therefore **not** part of the 1,897,365-byte tally.

| File | Size | Why it was live | Disposal |
|---|---|---|---|
| `resources/js/Pages/ClientHome.jsx` | 9,577 B | rendered by `HomeController` at `/home` | **DELETED** |
| `app/Http/Controllers/HomeController.php` | 1,088 B | only producer of `ClientHome` props; registered in `routes/web.php` | **DELETED** |
| `tests/Feature/HomeControllerTest.php` | 1,305 B | covered `GET /home` | **DELETED** - its scoping intent moved to `DashboardControllerTest` |

## Dead CSS

| Selector in `resources/css/app.css` | Uses in `*.jsx` / `*.blade.php` | Confidence |
|---|---|---|
| `.glass-card` (+ `:hover`) | 0 | **High** |
| `.landing-section-title` | 0 | **High** |

Not dead (verified ≥1 use): `.glass-nav-btn`, `.glass-stat-bar`,
`.quick-action-btn`, `.landing-cta-*`, `.auth-input`, `.auth-submit`.

## Explicitly NOT dead

| File | Why it is live |
|---|---|
| `resources/js/Components/ResourceFormPage.jsx` | imported by `Pages/Documents/Edit.jsx` and `Components/ResourceForm.jsx` |
| `resources/js/Components/Card.jsx` | 14 references |
| `public/robots.txt` | never referenced in code by design - crawlers fetch `/robots.txt` directly |
| `public/js/pdf.worker.min.mjs` | referenced by `Pages/Documents.jsx` since `4c1cfcf` |

## Decision taken

Tick 1 of the offered options was chosen: **delete only source + legacy
icons, keep all image originals as a rollback safety net until Phase 5.**

Rationale as understood: the WebP conversions are new and unproven in
production, whereas the dead components and the superseded icons have no
possible consumer.

### Still pending for Phase 5

- 16 `backgrounds/*.jpg` (37.0 MB) + logo `.png` (275 KB) - image originals
- `public/test_ocr{,_v2}.php`
- `.glass-card` and `.landing-section-title` CSS (0 uses in `*.jsx` /
  `*.blade.php`; both already earmarked under "dead components/CSS")
