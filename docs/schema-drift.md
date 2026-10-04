# Schema drift matrix

Generated in Phase 0 of the refactor. Read-only: no MySQL DDL was executed.

**Method:** the full 44-file migration chain was run against a scratch SQLite file
(`DB_CONNECTION=sqlite`), then compared with the live MySQL schema
(`najenga-app` @ 127.0.0.1) via `information_schema.COLUMNS` / `STATISTICS`.

**Why this matters:** `migrations` records all 44 migrations as `batch 1`, but git
shows 14 later commits modifying files under `database/migrations/`. The migration
sources no longer describe the database that is actually in use. Every later schema
step must be checked against this table first.

## Result

| Area | Result |
|---|---|
| Tables | 24 live = 24 in migration chain. **No missing or extra tables.** |
| Columns | **0 drift on all 24 tables.** Column names match exactly. |
| Indexes | **Drift on 14 of 24 tables.** |
| Foreign keys | **0 enforced** (all tables MyISAM — see below). |

### Clean tables (10)

`activity_logs`, `conversations`, `jobs`, `media`, `migrations`, `notifications`,
`password_reset_tokens`, `personal_access_tokens`, `users`, `whatsapp_webhook_events`

### Drifted tables (14)

All drift is index **naming**; column sets are identical everywhere.

| Table | Migration chain declares | Live MySQL has |
|---|---|---|
| `annotations` | `annotations_user_id_index` | `annotations_user_id_foreign` |
| `comments` | `comments_user_id_index` | `comments_parent_id_foreign`, `comments_user_id_foreign` |
| `conversation_user` | `conversation_user_user_id_index` | `conversation_user_user_id_foreign` |
| `documents` | `documents_user_id_index` | `documents_folder_id_foreign`, `documents_project_id_foreign`, `documents_user_id_foreign` |
| `expenses` | `expenses_user_id_index`, `expenses_project_id_index` | `expenses_project_id_foreign`, `expenses_user_id_foreign` |
| `folders` | `folders_project_id_index`, `folders_parent_id_index` | `folders_parent_id_foreign`, `folders_project_id_foreign` |
| `messages` | `messages_user_id_index` | `messages_conversation_id_foreign`, `messages_user_id_foreign` |
| `photos` | `photos_user_id_index` | `photos_project_id_foreign`, `photos_user_id_foreign` |
| `project_user` | `project_user_project_id_index`, `project_user_user_id_index` | `project_user_user_id_foreign` |
| `project_timelines` | — | `project_timelines_project_id_foreign` |
| `projects` | — | `projects_manager_id_foreign` |
| `receipts` | — | `receipts_expense_id_foreign` |
| `whatsapp_contacts` | — | `whatsapp_contacts_user_id_foreign` |
| `whatsapp_logs` | — | `whatsapp_logs_user_id_foreign` |

## Interpretation

**Root cause.** Live index names ending in `_foreign` are the names MySQL generates
for the index that accompanies a `FOREIGN KEY` clause. The migration sources have
since been edited to remove the `->constrained()` / `foreign()` calls (commits
`a84a79a`, `cede199`, `06d1a9e` and 11 others), leaving plain `->index()`, which
generates `_index` names. The recorded `batch 1` run therefore used the **older**
file contents.

**What this means in practice:**

1. `php artisan migrate:fresh` on a clean database will produce a **different index
   naming** than the database in production. Columns are unaffected.
2. The `migrations` table no longer answers "which migration produced this index".
3. Because every table is MyISAM, the original `FOREIGN KEY` clauses were parsed and
   silently discarded by MySQL — the `_foreign` **index names** survive, but no
   constraint was ever created. `information_schema.REFERENTIAL_CONSTRAINTS` for
   `najenga-app` returns **0 rows**.
4. A `dropForeign()` call against this schema raises `ERROR 1091` — already
   encountered once in commit `06d1a9e`.

**Consequence for the refactor:** Phase 4 (MyISAM → InnoDB + FK re-add) must
reconcile index names deliberately rather than assuming `dropForeign()` is safe.
Recommended order:

1. Fix `2026_08_06_000003_make_project_id_nullable_in_expenses.php` `down()`, which
   references a foreign key that does not exist.
2. Add a `default` arm to the `match()` in
   `2026_08_06_000002_drop_duplicate_indexes.php` (currently an `UnhandledMatchError`
   waiting to fire once FKs exist).
3. Convert engines table-by-table.
4. Add FKs one at a time, using `DROP INDEX` + `ADD CONSTRAINT` where an `_foreign`
   index already exists.

## Backup before Phase 4

```bash
mysqldump -uroot "najenga-app" > najenga-backup-$(date +%Y%m%d-%H%M%S).sql
```

## Reproduce

```powershell
$env:DB_CONNECTION="sqlite"; $env:DB_DATABASE="$env:TEMP\opencode\drift.sqlite"
php artisan migrate:fresh --force
mysqldump -uroot --no-data --skip-comments --compact "najenga-app"
```
