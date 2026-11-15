# Najenga

Najenga is a construction project platform: homeowners, managers and contractors
record spending, receipts, photos and documents per project. Laravel 12 API at the
root, React 19 app in `frontend/` (its pages in `resources/js/Pages`, served
through the page API in `frontend/src/najenga/inertia.jsx`).

## The OKJT kit

This project is built on the OKJT kit: `@okjt/ui`, `@okjt/site`,
`@okjt/dashboard` and `okjt/laravel-kit`, from `packages/` in
Juniortambo2628/OKJT. A fix made in the kit reaches every OKJTech project; a
fix made only here reaches only this one. So:

- **Use the kit before writing your own.** Before adding a component, hook,
  middleware or service, check whether the kit has it (each package's README,
  and `packages/UPGRADING.md` for what's new). The kit's components take
  options for how they look; set those rather than restyling the kit's
  classes with `!important` or `:has()`.
- **Never edit kit code** in `node_modules/` or `vendor/`, and never copy a
  kit piece into this project to change it.
- **Kit candidates.** When the kit is missing something or has a bug, make
  the smallest change here (an option, a thin wrapper) and add a line to the
  pull request: `Kit candidate: <what the kit should gain>`. Do the same when
  you build something here that isn't specific to this product and another
  OKJTech project could use. These lines are how fixes get back into the kit
  (OKJT `packages/CONSOLIDATION_PLAN.md`) instead of staying in one project.
- **Kit updates.** Dependabot opens a pull request when a kit version is
  released. Building on it: follow that release's entry in OKJT
  `packages/UPGRADING.md`, delete this project's own copy of anything the kit
  now provides, run the checks and the visual tests, and put desktop and
  390 px screenshots in the pull request.

Najenga still has its own copies of some kit pieces; `docs/plan-kit-6d.md`
lists them and what each waits on. Receipts, OCR, the expense sheet, the image
annotator, comments, `DetailPage`, `FilePreview` and `StatusBadge` stay
Najenga's own.
