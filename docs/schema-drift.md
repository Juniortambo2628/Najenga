# Schema drift matrix

Generated in Phase 0 of the refactor; refreshed for **Phase 4.5** after the
MyISAM → InnoDB conversion and foreign-key restoration. Read-only queries only.

**Method:** the full migration chain was compared against the live MySQL schema
(`najenga-app` @ 127.0.0.1) via `information_schema.COLUMNS` / `STATISTICS` /
`REFERENTIAL_CONSTRAINTS` / `TABLES`. Chain-side structure comes from running
the chain against a scratch SQLite file (`DB_CONNECTION=sqlite`); fresh-MySQL
behaviour was cross-checked on a scratch database restored from a live backup.

**History:** at Phase 0 the live database had 0 enforced foreign keys — every
table was MyISAM, so the `FOREIGN KEY` clauses of the original batch-1 run were
parsed and silently discarded, leaving only MySQL's auto-generated `_foreign`
**index names**. The migration sources had also been edited afterwards (FK
clauses removed, `constrained()` calls stripped), so a fresh install produced
different index names than the live database. Phase 4 repaired all of this:
backup taken, full-chain rollback fixed (4.1), engines converted (4.2), 24
foreign keys re-added (4.3), deletes made transactional/cascade-safe (4.4).

## Result (current)

| Area | Result |
|---|---|
| Tables | 30 live = 30 in migration chain. **No missing or extra tables.** |
| Columns | **0 drift on all 30 tables (300 columns).** |
| Engines | **29 InnoDB + 1 MyISAM** — only the framework-owned `migrations` bookkeeping table remains MyISAM (intentional). |
| Foreign keys | **24 enforced** (was 0). |
| Indexes | 103 index entries; the `_foreign`-named indexes are now backed by real constraints. Chain-vs-live **index naming** differences remain (documentation-only, see below). |

### Foreign keys (24)

| Child | Column | Parent | ON DELETE |
|---|---|---|---|
| `activity_logs` | `user_id` | `users.id` | SET NULL |
| `annotations` | `user_id` | `users.id` | CASCADE |
| `comments` | `parent_id` | `comments.id` | CASCADE |
| `comments` | `user_id` | `users.id` | CASCADE |
| `conversation_user` | `conversation_id` | `conversations.id` | CASCADE |
| `conversation_user` | `user_id` | `users.id` | CASCADE |
| `documents` | `folder_id` | `folders.id` | SET NULL |
| `documents` | `project_id` | `projects.id` | CASCADE |
| `documents` | `user_id` | `users.id` | CASCADE |
| `expenses` | `project_id` | `projects.id` | CASCADE |
| `expenses` | `user_id` | `users.id` | CASCADE |
| `folders` | `parent_id` | `folders.id` | CASCADE |
| `folders` | `project_id` | `projects.id` | CASCADE |
| `messages` | `conversation_id` | `conversations.id` | CASCADE |
| `messages` | `user_id` | `users.id` | CASCADE |
| `photos` | `project_id` | `projects.id` | CASCADE |
| `photos` | `user_id` | `users.id` | CASCADE |
| `project_timelines` | `project_id` | `projects.id` | CASCADE |
| `project_user` | `user_id` | `users.id` | CASCADE |
| `projects` | `client_id` | `users.id` | CASCADE |
| `projects` | `manager_id` | `users.id` | SET NULL |
| `receipts` | `expense_id` | `expenses.id` | CASCADE |
| `whatsapp_contacts` | `user_id` | `users.id` | CASCADE |
| `whatsapp_logs` | `user_id` | `users.id` | SET NULL |

The set = the 16 constraints a fresh MySQL chain creates (exact delete rules
copied from a fresh install) plus the 8 the original production schema had
(all CASCADE, recovered from git history): `annotations.user_id`,
`comments.user_id`, `conversation_user.user_id`, `expenses.project_id`,
`folders.parent_id`, `folders.project_id`, `messages.user_id`,
`project_user.user_id`. Each is a separate guarded migration
(`2026_10_10_0010NN_add_fk_*`); 0 orphans existed on any of the 24 columns
before the constraints were added. All app-table deletes that previously
relied on MyISAM's lack of cascading now clean up through model events plus
DB cascades (see `Project::booted`, `DB::transaction` wraps, `BatchDeletes`).

### Remaining (documentation-only) index naming drift

Running the chain on SQLite still yields plain `_index` names where live has
`_foreign` names (SQLite does not materialise FK indexes). This affects 14
tables (`annotations`, `comments`, `conversation_user`, `documents`,
`expenses`, `folders`, `messages`, `photos`, `project_user`,
`project_timelines`, `projects`, `receipts`, `whatsapp_contacts`,
`whatsapp_logs`) and has **no runtime effect**: live names are the canonical
ones now enforced by the 24 constraints above.

### Tables without foreign keys (15)

`conversations`, `failed_jobs`, `job_batches`, `jobs`, `login_codes`, `media`,
`migrations`, `notifications`, `passkeys`, `password_reset_tokens`,
`personal_access_tokens`, `sessions`, `users`, `whatsapp_settings`,
`whatsapp_webhook_events`

## Phase 4 record

| Step | Commit | What happened |
|---|---|---|
| backup | — | Full dump taken before any DDL: `%TEMP%\opencode\najenga-app-backup-before-phase4.sql` (30 tables, raw ASCII SQL). |
| 4.1 | `b8a0316` | Full-chain `migrate:reset` + re-`migrate` now pass: fixed `transform_passkeys` down() (binary column before raw bytes), `make_project_id_nullable` down() (name-agnostic index drop, NULL-safe NOT NULL), `drop_duplicate_indexes` match() default arm + guarded down(), `add_draft_status` down() no-op while drafts exist. |
| 4.2 | `ff68dfd` | Six grouped migrations convert the 28 MyISAM tables to InnoDB (conditional, re-runnable; `down()` refuses to convert a table that still holds FKs). |
| 4.3 | `2308bf5` | 24 per-constraint migrations re-add the foreign keys (guards skip existing ones so the fresh chain's 16 do not collide); constraint names match the pre-existing `_foreign` indexes so MySQL reuses them. |
| 4.4 | `64326d6` | Deletes are transactional and cascade-safe; project delete cleans children's media before DB cascades; batch deletes iterate models so events fire. |
| 4.5 | (this file) | Drift matrix refreshed: 0 column drift, 29/1 engines, 24 FKs. |

## Reproduce

```powershell
# live side (read-only):
& "C:\wamp64\bin\mysql\mysql9.1.0\bin\mysql.exe" -uroot -N -e "SELECT engine, COUNT(*) FROM information_schema.tables WHERE table_schema='najenga-app' GROUP BY engine"
& "C:\wamp64\bin\mysql\mysql9.1.0\bin\mysql.exe" -uroot -N -e "SELECT COUNT(*) FROM information_schema.referential_constraints WHERE constraint_schema='najenga-app'"
& "C:\wamp64\bin\mysql\mysql9.1.0\bin\mysql.exe" -uroot -N -e "SELECT CONCAT(table_name,'.',column_name) FROM information_schema.columns WHERE table_schema='najenga-app' ORDER BY table_name, ordinal_position"
```
