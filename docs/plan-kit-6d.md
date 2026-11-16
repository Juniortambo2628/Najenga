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
| 6d.5 | Not done: `useAdminAction` needs a TanStack Query client in every page test, and what it adds (refreshing the kit's history queries and collaboration) Najenga doesn't use; its history drawer is its own. `useAction` stays. |
| 6d.6 | Kit 0.7: the bell on `NotificationsBell` (`useNotifications`, `renderButton` / `renderPanel`, `markOnePath`) and the tour on `AdminTutorial` (`render`, `scrollIntoView={false}`), each drawn in Najenga's look. |

## Gaps found in the kit

Fix these in the kit, then finish the step that waits on them.

| Kit piece | Gap | Najenga until then |
|---|---|---|
| `@okjt/ui` `Modal` | Widths stop at `5xl` (the receipt and photo preview is `7xl`); its own close button can't be turned off, so a dialog with its own header gets two; no title, tabs or footer | Keeps its own `Modal` |
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
