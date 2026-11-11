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
| 6d.2 | #85: buttons, ContextMenu and the confirm dialog. `Modal` waits on the kit (below). |
| 6d.3 | `Card`: this PR. The inputs wait on the kit (below). |
| 6d.4 | Not done: Najenga's `useFilteredItems` and `useUnsavedChangesGuard` do more than the kit's (below), and `useVisibleActions` / `useRole` decide per project and record where the kit's permissions are one switch for the page. They stay Najenga's. |
| 6d.5 | Not done: `useAdminAction` needs a TanStack Query client in every page test, and what it adds (refreshing the kit's history queries and collaboration) Najenga doesn't use; its history drawer is its own. `useAction` stays. |
| 6d.6 | Waiting for a decision: `NotificationsBell` expects `{ title, message, link, icon }` at the top of each item and marks all read on `POST /notifications/mark-read` (Najenga's are Laravel database notifications with those under `data`, and it marks them one by one or with `read-all`); `AdminTutorial` targets ids, has no open state, doesn't skip stops off screen or take arrow keys. Each needs server or kit changes first. |

## Gaps found in the kit

Fix these in the kit, then finish the step that waits on them.

| Kit piece | Gap | Najenga until then |
|---|---|---|
| `@okjt/ui` `Modal` | Widths stop at `5xl` (the receipt and photo preview is `7xl`); its own close button can't be turned off, so a dialog with its own header gets two; no title, tabs or footer | Keeps its own `Modal` |
| `@okjt/ui` `ContextMenu` | Doesn't return focus to whatever opened it when it closes | Najenga's `ContextMenu` adapter does it |
| `@okjt/dashboard` `AdminInput`, `AdminSelect`, `AdminTextarea` | No background of their own, so `@tailwindcss/forms` makes them white on a dark dashboard; no `ref` (forms focus fields); label and error built in, where Najenga's forms place them separately | Keeps `TextInput`, `SelectInput`, `TextArea` |
| `@okjt/dashboard` `useUnsavedChangesGuard` | Only catches link clicks, not the router's own visits; no "Unsaved changes" chip in the header | Keeps its own guard |
| `@okjt/dashboard` `useFilteredItems` | Searches every field; no project filter, chosen fields or sort | Keeps its own |
