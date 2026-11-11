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
| 6d.2 | Buttons, ContextMenu and the confirm dialog: this PR. `Modal` waits on the kit (below). |

## Gaps found in the kit

Fix these in the kit, then finish the step that waits on them.

| Kit piece | Gap | Najenga until then |
|---|---|---|
| `@okjt/ui` `Modal` | Widths stop at `5xl` (the receipt and photo preview is `7xl`); its own close button can't be turned off, so a dialog with its own header gets two; no title, tabs or footer | Keeps its own `Modal` |
| `@okjt/ui` `ContextMenu` | Doesn't return focus to whatever opened it when it closes | Najenga's `ContextMenu` adapter does it |
