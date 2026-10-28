# Najenga ← Naoa: structure and collaboration plan

Bringing Najenga's dashboard closer to Naoa's structure, and adding Naoa's
collaboration features: sharing with roles, version history, and who is
online. Same protocol as `plan.md`:
- plan approved before code;
- one commit per step (message in `.git/COMMIT_MSG_TMP`, `git commit -F`);
- gate after every step: `php artisan test` · `npm run test:js` · `npm run build`;
- schema changes additive and reversible, destructive ones item by item.

Phases 10–15 follow on from phases 0–9.

## Where things stand

| Area | Naoa | Najenga today | Gap |
|---|---|---|---|
| Page title in the navbar on scroll | ✓ | ✓ (#34) | — |
| One floating toolbar: search, filters, view, actions, selection | ✓ | ✓ on 8 list pages (#34, Receipts in this branch) | Detail/edit pages, WhatsApp, Messages, Activity Logs |
| Lists that fit the screen | ✓ | Expenses, Users, Receipts | Projects/Documents/Photos grids |
| One page layout (hero → summary cards → content + side panel → toolbar) | `AdminPageLayout` | Each page assembles its own | **Phase 10** |
| Summary cards that double as filters | ✓ | `StatCard` on some pages, not linked to filters | Phase 10 |
| Shared side panel (sections, tools, activity; chips/sheet on phones) | ✓ | None | Phase 10 |
| One way to save: confirm, pending, toast, refresh, role | `useAdminAction` | Ad-hoc `router.*`/`axios` per page; 19 `window.confirm` calls | **Phase 11** |
| Styled confirm/prompt dialogs | `confirmAction()` + one host | `window.confirm` | Phase 11 |
| Unsaved-changes guard | ✓ | None | Phase 11 |
| Sharing with roles | Wedding collaborators: owner / editor / viewer, email invites, accept flow | `project_user` with editor / viewer, add by email of an existing user | **Phase 12** |
| Role enforced everywhere | Middleware + UI hides edit actions for viewers | `ProjectPolicy@update` allows any member, viewers included | Phase 12 (security) |
| Version history and restore | `Revision` + `RecordsRevisions`, drawer per page, 10-minute coalescing, 180-day retention | `activity_logs` (text descriptions, no before/after) | **Phase 13** |
| Who is online, and where | Heartbeat every 20s; avatars in the header; "also here" | None | **Phase 14** |
| Unseen changes per page (sidebar badges) | ✓ | None | Phase 14 |
| Default side panel: activity, who's here, share and history shortcuts | ✓ | Activity Logs is a separate page | Phase 14 |

## Decisions needed before starting

| # | Question | Recommendation |
|---|---|---|
| 1 | Roles: keep the global role (admin / manager / client) **and** add a per-project role? | Yes. The global role decides what a person can do in Najenga; the project role decides what they can do in one project. Project roles: owner, manager, editor, viewer (viewer = read and comment only). |
| 2 | Invite people who don't have an account yet? | Yes: an emailed invite link that creates the account and joins the project (Naoa's accept flow). |
| 3 | Which records get version history? | Projects, Expenses, Receipts (fields, not images), Documents and Photos (metadata, not files), Timeline milestones. Not messages or activity logs. |
| 4 | How long to keep versions? | 180 days, like Naoa. Rapid edits by one person to one record merge into one version (10 minutes). |
| 5 | Restore deleted records? | Yes, which needs soft deletes on those tables (additive migration). Files of deleted media are kept for 30 days, then purged. |
| 6 | Presence: polling or websockets? | Polling first (one heartbeat request every 20s, paused in hidden tabs), like Naoa: it works on the current host with no new service. Move to Laravel Reverb later if needed (`BROADCAST_CONNECTION` is `log` today). |
| 7 | Where does the project switcher live? | Today it is in the floating toolbar. With per-project sharing, consider a project context in the navbar ("Kitengela site ▾") that every page follows. |

## Phase 10 — One page layout

| ID | Step |
|---|---|
| 10.1 | `DashboardPage` layout component: `hero`, `summary`, `children`, `panel`, `toolbar` props; `fill` for fit-to-screen pages. Pages pass config; no page builds its own hero/toolbar wrapper. Tests. |
| 10.2 | `SummaryCards`: label, value, icon, hint, `onClick` + `active` (a card applies a filter). Move `StatCard` uses onto it. |
| 10.3 | `SidePanel`: section switcher (badges/counts), tools, list; collapsible to an icon rail (remembered per panel); phones: chip bar under the navbar, or bottom sheet when it has tools. |
| 10.4 | `ListPanel`: pinned header/footer, only the body scrolls in fit mode; sticky table headers. Replace the hand-written fit wrappers on Expenses, Users, Receipts. |
| 10.5 | Move pages over, a few per commit: list pages first, then detail pages (Projects/Show, Documents/Show, Photos/Show, Users/Show), then Dashboard, Analytics, WhatsApp, Messages, Activity Logs, Profile. |
| 10.6 | `EmptyState` speaks about the search ("No expenses match 'cement'"); `QueryError`-style retry where data loads client-side; never placeholder numbers. |

## Phase 11 — One way to save

| ID | Step |
|---|---|
| 11.1 | `useAction(fn, { confirm, success, error, only, preserveScroll })` around `router.post/put/patch/delete`, `useForm` and axios calls: pending state, toasts (no double toasts with `FlashToast`), partial reloads, role check. Tests. |
| 11.2 | `confirmAction()` / `promptAction()` with one `ConfirmHost` in `AuthenticatedLayout` (Headless UI dialog; danger tone). Replace the 19 `window.confirm` calls. |
| 11.3 | `useUnsavedChangesGuard(dirty)`: Inertia `router.on('before')` + `beforeunload`; "Unsaved changes" chip in the navbar. Wire into ExpenseForm, ResourceForm, Profile, Documents/Photos edit. |
| 11.4 | A test that fails when a page calls a write directly instead of through `useAction` (as Naoa's `adminWrites.test.js`). |

## Phase 12 — Sharing and roles (security first)

| ID | Step |
|---|---|
| 12.1 | **Fix now, ahead of the rest:** `ProjectPolicy@update` checks the member's role (viewer can't update); same for expenses/documents/photos/timeline under a shared project. Cross-role tests. |
| 12.2 | `project_user.role`: owner / manager / editor / viewer (+ `invited_at`, `accepted_at`, `invited_by`); backfill: client_id → owner. Additive migration. |
| 12.3 | `ProjectRole` helper + `can('edit', $project)` gates used by Form Requests and policies; Inertia shares the current user's role for the active project. |
| 12.4 | Invites by email for people without an account: signed link → sign-up → joined. Pending invites listed, resendable, revocable. Mail + tests. |
| 12.5 | Share panel opened from the navbar (or the project page): members with avatars, role picker, remove, pending invites. Replaces `ShareProjectModal`. Every change written to `activity_logs`. |
| 12.6 | `useRole()` / `useVisibleActions()`: toolbar, bulk actions and row menus hide edit actions for viewers; `readOnly: true` marks view/export/download actions. A test renders pages as a viewer. |

## Phase 13 — Version history

| ID | Step |
|---|---|
| 13.1 | `revisions` table: `revisionable_type/id`, `project_id`, `user_id`, `event` (created / updated / deleted / restored), `before` / `after` JSON, timestamps. Additive. |
| 13.2 | `RecordsRevisions` trait (ported from Naoa): records on create/update/delete; skips noise columns; merges rapid edits by the same person (10 min); paused during migrations and seeding; `MassPrunable` at 180 days. On Project, Expense, Receipt, Document, Photo, ProjectTimeline. Tests. |
| 13.3 | Soft deletes on those tables (additive `deleted_at`); lists exclude trashed rows; media files of trashed rows kept 30 days (scheduled purge). |
| 13.4 | API: list a record's or a page's versions (paginated, with who/when/what changed); restore a version (policy: editor+); restore a deleted record. |
| 13.5 | Version history drawer opened from the navbar (history icon): versions of the records on the current page, field-level diff ("Amount: 15,300 → 20,000"), Restore. After a restore the page reloads its props. |
| 13.6 | Activity Logs page reads revisions for record changes (keeps logins/system events from `activity_logs`). |

## Phase 14 — Who is online, and what changed

| ID | Step |
|---|---|
| 14.1 | `users.current_page`, `users.seen_at` (additive). `POST /presence/heartbeat` every 20s and on every Inertia navigation, paused while the tab is hidden; returns who else is online in the same projects and the page each is on. |
| 14.2 | Navbar avatars of collaborators online (tooltip: name, page); "Also here" chip on a page others are viewing; avatars on project cards. |
| 14.3 | `page_visits` (user, module, seen_at): sidebar badges count changes by others (from revisions) since you last opened that page. |
| 14.4 | Default side panel for pages without their own: who's here, latest changes on this page, Share and History shortcuts; starts collapsed to a rail so lists keep their width. |
| 14.5 | Optional later: Laravel Reverb for instant presence and "X just added an expense" toasts; the heartbeat stays as the fallback. |

## Phase 15 — Finish and polish

| ID | Step |
|---|---|
| 15.1 | Saved views for filters (per browser), as Naoa's `useSavedViews`. |
| 15.2 | Mobile: sidebar starts closed below `lg`; side panel chips; toolbar wraps on 360px. |
| 15.3 | A short dashboard tour for new users (restartable from the help menu). |
| 15.4 | Visual regression tests (Playwright) for the shell, toolbar and a list page in dark theme. |

## Order and size

Phase 12.1 first (a security fix on its own), then 10 → 11 → 12 → 13 → 14 →
15. Phases 10 and 11 change no data and can ship page by page. Phases 12–14
each start with an additive migration and stop for review before the UI.
About 45 commits.

## Definition of done

- Every dashboard page renders through `DashboardPage`; no page imports its
  own hero wrapper, toolbar or bulk bar.
- No `window.confirm` left; every write goes through `useAction` (guarded by
  a test).
- A viewer sees no edit control anywhere and gets 403 from every write route
  (tested per resource).
- Every change to the six versioned models can be seen and restored from the
  history drawer; deleted records can be restored for 30 days.
- Collaborators online appear within 20s; sidebar badges match unseen
  changes.
- Gates green: PHP tests, JS tests, build.

## Status

Shipped, one PR per step, all merged to `main` (October 2026):

| Phase | PRs |
|---|---|
| 12.1 security fix | #36 |
| 10 One page layout | #37–#39 |
| 11 One way to save | #40–#43 |
| 12 Sharing and roles | #44 (schema), #45–#47, #48 (members see shared records), #49 (navbar project switcher), #50 |
| 13 Version history | #51–#55 |
| 14 Who is online | #56–#59 (14.5, Reverb, left for later as planned) |
| 15 Finish and polish | #60 (mobile), #61 (saved views), #62 (tour), #63 (visual tests) |

Visual regression tests: `npm run test:visual` locally (`-- -u` writes new
baselines). On GitHub the "Visual" workflow runs them on PRs and on `main`
without blocking deploys; tick "update" on a manual run to remake the
baselines after an intended change to the look.
