# Najenga ← OKJT kit: Phase 6d, the kit's components in place of Najenga's copies

Phase 6 of the kit (`packages/SPEC.md` in Juniortambo2628/OKJT) put Najenga on
the kit: the app in `frontend/`, the page layout, hero, summary cards, list
panel, side panel, floating toolbar and sign-in all from `@okjt/dashboard`.
Najenga still keeps its own copies of pieces the kit now has. Phase 6d swaps
them for the kit's, so a fix in the kit reaches Najenga as it reaches Naoa.

Najenga keeps what is its own: receipts and OCR, the expense sheet, the image
annotator, comments, `DetailPage`, `FilePreview` and `StatusBadge`.

## Steps

One PR per step, merged when green.

| Step | Najenga's own | The kit's |
|---|---|---|
| 6d.1 | `BulkActions`, `useSavedViews` (nothing used them) | none: removed |
| 6d.2 | `Button`, `PrimaryButton`, `SecondaryButton`, `DangerButton`, `CancelButton`, `Modal`, `ContextMenu` + `useContextMenu`, `ConfirmHost` | `@okjt/ui` `Button`, `Modal`, `ContextMenu`, `ConfirmHost` |
| 6d.3 | `TextInput`, `SelectInput`, `TextArea`, `Card` | `AdminInput`, `AdminSelect`, `AdminTextarea`, `AdminCard` |
| 6d.4 | `useFilteredItems`, `useUnsavedChangesGuard`, `useVisibleActions` / `useRole` | the kit's hooks and `permissions` |
| 6d.5 | `useAction` | `useAdminAction` |
| 6d.6 | `Tour`, `NotificationsDropdown` | `AdminTutorial`, `NotificationsBell` |
| 6d.7 | `HistoryDrawer` / `VersionList`, `SharePanel` / `NavbarShare`, `OnlinePeople` / `PageActivityPanel` / presence heartbeat | `VersionHistoryDrawer`, `ShareModal`, `CollaborationProvider` / `ActivityPanel` |

6d.7 talks to Najenga's own history, sharing and presence endpoints and may
need the server side on `okjt/laravel-kit` too. It is reported on before any
change.

## Checks for every step

- `php artisan test`, `npm run test:js`, `npm run build`.
- The dashboard screenshots (`npm run test:visual`) unchanged, or each
  difference named in the PR.

## Status

| Step | PR |
|---|---|
| 6d.1 | #84 |
| 6d.2 | #85: buttons, ContextMenu and the confirm dialog. Kit 0.6: `Modal` on the kit's dialog (Najenga's chrome inside it). |
| 6d.3 | #86: `Card`. Kit 0.6: the fields on the kit's, with Najenga's classes (`Components/fieldClasses.js`). |
| 6d.4 | Done: `useUnsavedChangesGuard` on the kit's guard (kit 0.5); `useFilteredItems` an adapter onto the kit's (kit 0.8: `where`, `searchFields`, `sortFn`). `useVisibleActions` / `useRole` stay Najenga's. |
| 6d.5 | Kit 0.9: `useAction` is a thin wrapper on the kit's `useAdminAction` (confirm, pending per item, success toast), with `refreshHistory: false` (Najenga's history is its own). Najenga keeps `visit()`, `only` (Inertia reloads), `allowed` and its error toasts, which read Inertia's validation errors (the kit's `notifyError` doesn't: kit candidate). |
| 6d.6 | Kit 0.7: the bell on `NotificationsBell` (`useNotifications`, `renderButton` / `renderPanel`, `markOnePath`) and the tour on `AdminTutorial` (`render`, `scrollIntoView={false}`), each drawn in Najenga's look. |

## Gaps found in the kit

Fix these in the kit, then finish the step that waits on them.

| Kit piece | Gap | Najenga until then |
|---|---|---|
| `@okjt/ui` `Modal` | ~~Widths stop at `5xl`; close button can't be turned off; no title, tabs or footer~~ Fixed: widths, close and title/footer in kit 0.5, tabs and a footer per tab in kit 0.11 | `Modal` draws its chrome on the kit's dialog (kit 0.6); the user and expense dialogs could move to the kit's `tabs` (a look change, so its own PR with screenshots) |
| `@okjt/ui` `ContextMenu` | ~~Doesn't return focus to whatever opened it~~ Fixed in kit 0.5 | Adapter's own focus return removed |
| `@okjt/dashboard` `AdminInput`, `AdminSelect`, `AdminTextarea` | No background of their own, so `@tailwindcss/forms` makes them white on a dark dashboard; no `ref` (forms focus fields); label and error built in, where Najenga's forms place them separately | Keeps `TextInput`, `SelectInput`, `TextArea` |
| `@okjt/dashboard` `useUnsavedChangesGuard` | ~~Only catches link clicks; no chip~~ Fixed in kit 0.5 (`confirmLeave`, `useHasUnsavedChanges`) | On the kit's guard |
| `@okjt/dashboard` `useFilteredItems` | Searches every field; no project filter, chosen fields or sort | Keeps its own |

## Kit 0.5 (R1 of OKJT's consolidation plan)

Kit 0.5 closed the gaps 6d.2, 6d.3 and 6d.6 were waiting on: `Modal` widths
up to `7xl`, `showClose`, `title` and `footer`; fields with a `ref`, `bare`
and their own background (`--okjt-field-bg`, `--okjt-field-text`);
`NotificationsBell`'s `listPath` / `markAllPath` / `map`; `AdminTutorial`'s
`open`, `skipMissing`, selectors and keys. Still missing: tabs in `Modal`
(R2, for the user and expense dialogs), and a backdrop option.

Decided (option B): the kit gains style options first, so Najenga switches
with its screenshots unchanged. Kit 0.6 did that for the fields and the
dialogs, kit 0.7 for the bell and the tour. Still Najenga's own:
`useAction` (6d.5),
`useVisibleActions` / `useRole`, and what was always Najenga's (receipts,
OCR, the expense sheet, the annotator, comments, `DetailPage`, `FilePreview`,
`StatusBadge`).

## Kit 0.11

Versions only; nothing on screen changes. `@okjt/dashboard` 0.11, `@okjt/ui`
0.6, `okjt/laravel-kit` 0.11 (`@okjt/site` stays 0.3).

- laravel-kit 0.10 changed where emailed reset links point when an app has
  its own `password.reset` route (Najenga does): Laravel's own link to it.
  `config/okjt.php` sets `password_reset.link_to_app => true`, so the link
  stays `{FRONTEND_URL}/reset-password/{token}?email=…` as before.
- New in the kit, not used here yet: `Modal` `tabs` / `footer` per tab /
  `fixedHeight` / `sheet`; `shell.tabBar`; `shell.pageSkeleton`;
  `undoable` / `useUndoableRemoval`; `StepFlow`; `formatNumber` /
  `formatDateTime` / `statusLabel`. Each would change how something looks
  or behaves, so each is its own PR.

