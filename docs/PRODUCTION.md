# Production runbook

## Where it runs (since 2026-10-29)

Najenga is fully on the OKJTech Hestia VPS via the shared **deploy-kit**
(`Juniortambo2628/OKJT` → `deploy-kit/README.md`):

```
Cloudoon DNS  najenga.okjtech.co.ke (+ www)  →  102.212.246.224
Hestia VPS (Debian 12): nginx (LE cert, HTTPS forced) → Apache → PHP-FPM 8.3
  public_html → /home/dev/web/najenga.okjtech.co.ke/private/najenga/current/public
  private/najenga/{releases/<utc>-<sha>, shared/.env, shared/storage, current}
  MariaDB: dev_najenga (user dev_dev_najenga)
  PM2: najenga-scheduler (schedule:work), queue off while QUEUE_CONNECTION=sync
```

Push to `main` → "CI Tests" → "Deploy to Production" calls
`OKJT/.github/workflows/deploy-laravel.yml@main`: build on the runner → rsync
release → migrate → caches → atomic symlink switch → PM2 restart → verify
(`/health`). Rollback (as `dev`):

```bash
cd ~/web/najenga.okjtech.co.ke/private/najenga && ls releases/
ln -sfn "$PWD/releases/<previous>" current.new && mv -Tf current.new current
sudo -n systemctl reload php8.3-fpm
```

GitHub secrets: `VPS_*` (shared, via `deploy-kit/local/set-vps-secrets.ps1`)
and `PROD_ENV` (the full production `.env`; DB_* point at the Hestia DB).
The old `SSH_*` secrets remain only for the decommissioned cPanel deploy.

## The old cPanel VPS (rollback only)

The previous hosting (cPanel box 141.95.3.80, code in `~/najenga-core`,
old MySQL data) is kept untouched as an emergency rollback. To activate it
temporarily: point the DNS A record back to `51.89.113.223` (its edge
serves a valid `*.okjtech.co.ke` cert). When the Hestia move is confirmed,
decommission it and delete the `SSH_*` secrets.

## Recommended `.env` overrides for production

These are already in `PROD_ENV` unless noted:

```
LOG_CHANNEL=stack
LOG_STACK=daily
LOG_LEVEL=info
LOG_DAILY_DAYS=14

QUEUE_CONNECTION=sync        # flip to database AND set queue: true in deploy.yml
                             # if OCR/WhatsApp should leave the request path
```

`CACHE_STORE`/`SESSION_DRIVER` are `file` (shared/storage); Redis is not
installed on the VPS — add it first if you switch these.

## Error alerting (optional)

Zero-install: pipe errors to Slack via an incoming webhook.

```
LOG_STACK=daily,slack
LOG_SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
LOG_LEVEL=info
```

For a full error tracker, add `sentry/sentry-laravel` and set `SENTRY_LARAVEL_DSN`.

## Debugging on production

- Logs: `/home/dev/web/najenga.okjtech.co.ke/private/najenga/shared/storage/logs/`
  (as `dev` on the VPS).
- Scheduler: `pm2 logs najenga-scheduler` / `pm2 ls` (as `dev`).
- `https://najenga.okjtech.co.ke/health` returns JSON: `{status, checks:{app,db,cache,storage_writable}, time}`.
- TLS certificates: `~/web/najenga.okjtech.co.ke/conf/ssl/`; renewed daily at
  03:15 by root cron `v-update-letsencrypt-ssl`.
- Hestia gotcha: saving the domain in Hestia's Edit form resets the proxy
  settings; re-run `v-add-web-domain-proxy dev najenga.okjtech.co.ke default`
  and `v-rebuild-web-domain dev najenga.okjtech.co.ke` if nginx confs vanish.

## WhatsApp

- Admin can inspect the current config and send a test message at `/whatsapp` (admin-only).
- Webhook: `POST /api/whatsapp/webhook` (verified via `META_WHATSAPP_VERIFY_TOKEN`).
- Inbound receipt images run inline while `QUEUE_CONNECTION=sync`; switch to
  the database queue (see above) to move OCR off the request path.

### Meta app setup

1. developers.facebook.com → **Create App** → *Business* → use case **Connect with customers through WhatsApp**.
2. **WhatsApp → API Setup**: copy `Phone Number ID` and generate a permanent **System User** access token in Business Settings.
3. **App Settings → Basic**: copy `App ID` and `App Secret`.
4. **WhatsApp → Configuration**: Callback URL = `https://najenga.okjtech.co.ke/api/whatsapp/webhook`, Verify Token = your chosen string. Subscribe to the `messages` field.
5. Update `PROD_ENV`, re-run the deploy.
