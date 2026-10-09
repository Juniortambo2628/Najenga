# Schema drift matrix

Regenerated 2026-10-09 (Phase 9.5 refresh of the Phase 0 matrix). Read-only: no
MySQL DDL was executed.

**Method:** the full 60-file migration chain was run against a scratch SQLite file
(`DB_CONNECTION=sqlite`), then compared with the live MySQL schema
(`najenga-app` @ 127.0.0.1) via `information_schema.COLUMNS` / `STATISTICS` /
`REFERENTIAL_CONSTRAINTS` / `TABLES`.

**Why this matters:** the `migrations` table records all 60 migrations across
batches 1–6, but git shows later commits modifying files under
`database/migrations/`. The migration sources no longer fully describe the
database that is actually in use — notably, `->constrained()` / `foreign()` calls
were edited out after the original run (see Interpretation). Every later schema
step must be checked against this table first.

## Result

| Area | Result |
|---|---|
| Tables | 30 live = 30 in migration chain. **No missing or extra tables.** |
| Columns | **0 drift on all 30 tables (300 columns).** Column names match exactly. |
| Indexes | **Drift on 14 of 30 tables.** (91 live named indexes vs 52 in the chain.) |
| Foreign keys | **0 enforced.** |
| Engines | 28 MyISAM + 2 InnoDB (`passkeys`, `whatsapp_settings`). |

### Clean tables (16)

`activity_logs`, `conversations`, `failed_jobs`, `job_batches`, `jobs`,
`login_codes`, `media`, `migrations`, `notifications`, `passkeys`,
`password_reset_tokens`, `personal_access_tokens`, `sessions`, `users`,
`whatsapp_settings`, `whatsapp_webhook_events`

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
`a84a79a`, `cede199`, `06d1a9e` and others), leaving plain `->index()`, which
generates `_index` names. The original batch-1 run therefore used the **older**
file contents; rows added since then landed in batches 2–6.

**What this means in practice:**

1. `php artisan migrate:fresh` on a clean database will produce a **different index
   naming** than the database in use. Columns are unaffected.
2. The `migrations` table no longer answers "which migration produced this index".
3. 28 of 30 tables are MyISAM, so `FOREIGN KEY` clauses on those tables were parsed
   and silently discarded — the `_foreign` **index names** survive, but no
   constraint was ever created. `information_schema.REFERENTIAL_CONSTRAINTS` for
   `najenga-app` returns **0 rows**. The two InnoDB tables (`passkeys`,
   `whatsapp_settings`) were created after the FK clauses were stripped, so they
   declare no FKs either.
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
3. Convert engines table-by-table (`2026_08_06_000003` + the 28 MyISAM tables).
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
# live side (read-only):
& "C:\wamp64\bin\mysql\mysql9.1.0\bin\mysql.exe" -uroot -N -e "SELECT table_name FROM information_schema.tables WHERE table_schema='najenga-app'"
& "C:\wamp64\bin\mysql\mysql9.1.0\bin\mysql.exe" -uroot -N -e "SELECT CONCAT(table_name,'.',column_name) FROM information_schema.columns WHERE table_schema='najenga-app' ORDER BY table_name, ordinal_position"
& "C:\wamp64\bin\mysql\mysql9.1.0\bin\mysql.exe" -uroot -N -e "SELECT CONCAT(index_name,' @ ',table_name) FROM information_schema.statistics WHERE table_schema='najenga-app' GROUP BY table_name, index_name"
```
