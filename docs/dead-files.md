# Dead file audit

Produced in Phase 1 to satisfy the ground rule *"prove 'unused' with listed
greps + confidence"*. **Nothing here has been deleted** - deletion needs an
explicit tick, and several entries are already on the Phase 5 approval list.

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

| File | Size | Refs | Evidence | Confidence |
|---|---|---|---|---|
| `resources/js/Components/IndexPageLayout.jsx` | 4,541 B | 0 | no `IndexPageLayout` anywhere in corpus; its only JSX child (`AuthenticatedLayout`) is used directly | **High** |
| `resources/js/Components/PageHeader.jsx` | 997 B | 0 | no `PageHeader` in corpus | **High** |
| `resources/js/Components/FileUploadZone.jsx` | 1,373 B | 0 | no `FileUploadZone` in corpus; `FileUploadModal` builds its own dropzone | **High** |
| `public/favicon.ico` | 0 B | 0 | no `favicon.ico` string in corpus; `app.blade.php` links `favicon-32/48/192.png` | **High** (0-byte anyway) |
| `public/favicon-512.png` | 100,238 B | 0 | no `favicon-512` in corpus; no `manifest.webmanifest` exists | **High** |
| `public/Najenga-logos/Najenga-favicon.png` | 1,675,234 B | 1 | only hit is `docs/perf-baseline.md`, which lists it as a target | **High** |
| `public/images/OKJTechLogo-White_Transparent.png` | 114,982 B | 0 | no `OKJTechLogo` in corpus | **High** |
| `public/test_ocr.php` | 1,643 B | 0 | no `test_ocr` in corpus | **High** - **already on Phase 5 list** |
| `public/test_ocr_v2.php` | 1,087 B | 0 | no `test_ocr` in corpus | **High** - **already on Phase 5 list** |
| 16 `public/Najenga-backgrounds/*.jpg` | 37,007,432 B | 1 each | superseded by `.webp` in commit `ece3510`; only hits are `docs/*.md` | **High** |
| `public/Najenga-logos/Najenga-Logo-header-footer-logo-transparent.png` | 274,604 B | 1 | superseded by `.webp` in `ece3510`; only hit is `docs/perf-baseline.md` | **High** |

**Total reclaimable: ~39.2 MB** (37.0 MB backgrounds + 1.68 MB favicon +
275 KB logo + 115 KB + 100 KB + 2.7 KB + 6.9 KB source).

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
| `resources/js/Pages/ClientHome.jsx` | rendered by `HomeController`, which is registered in `routes/web.php`. It dies only when `/home` is merged into `/dashboard` (decision 8, Phase **2.7H**) |
| `app/Http/Controllers/HomeController.php` | referenced by `routes/web.php` and `tests/Feature/HomeControllerTest.php` |
| `resources/js/Components/ResourceFormPage.jsx` | imported by `Pages/Documents/Edit.jsx` and `Components/ResourceForm.jsx` |
| `resources/js/Components/Card.jsx` | 14 references |
| `public/robots.txt` | never referenced in code by design - crawlers fetch `/robots.txt` directly |
| `public/js/pdf.worker.min.mjs` | referenced by `Pages/Documents.jsx` since `4c1cfcf` |

## Open question

Deleting the superseded `.jpg`/`.png` originals is the single largest win
(~39 MB) but is destructive. Options:

1. Delete all of the above now.
2. Delete only the 3 dead components + the 0-byte/legacy icons (~1.9 MB), keep
   image originals as a rollback safety net until Phase 5.
3. Defer everything to Phase 5.
