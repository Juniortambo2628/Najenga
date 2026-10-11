# Production runbook

## Recommended `.env` overrides for production

```
LOG_CHANNEL=stack
LOG_STACK=daily
LOG_LEVEL=info
LOG_DAILY_DAYS=14

QUEUE_CONNECTION=database        # was: sync — moves OCR / WhatsApp off the request path
CACHE_STORE=redis                # fall back to database if Redis is not available
SESSION_DRIVER=redis             # ditto

# Redis is already in .env — enable it in cPanel if needed
REDIS_CLIENT=phpredis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

After changing any of those, redeploy so `config:cache` picks them up.

## Cron jobs to add in cPanel

```
* * * * * cd $HOME/najenga-core && php artisan schedule:run >> /dev/null 2>&1
* * * * * cd $HOME/najenga-core && php artisan queue:work --stop-when-empty --tries=3 --timeout=120 >> $HOME/najenga-core/storage/logs/queue.log 2>&1
```

The second one only matters once `QUEUE_CONNECTION` is not `sync`.

## Error alerting (optional)

Zero-install: pipe errors to Slack via an incoming webhook.

```
LOG_STACK=daily,slack
LOG_SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
LOG_LEVEL=info                # daily channel level
# Slack channel uses env('LOG_LEVEL','critical') — override with:
# LOG_SLACK_LEVEL isn't defined; the stack sends >=info to Slack too.
```

For a full error tracker, add `sentry/sentry-laravel` and set `SENTRY_LARAVEL_DSN`. Run `composer require sentry/sentry-laravel` locally, commit, and it activates on next deploy.

## Debugging on production

- `tail -f ~/najenga-core/storage/logs/laravel-$(date +%F).log` (daily rotated file).
- `https://najenga.okjtech.co.ke/health` returns JSON: `{status, checks:{app,db,cache,storage_writable}, time}`.
- The deploy workflow now dumps the last 200 log lines on failure and runs `/health` after every deploy.

## WhatsApp

- Admin can inspect the current config and send a test message at `/whatsapp` (admin-only).
- Webhook: `POST /api/whatsapp/webhook` (verified via `META_WHATSAPP_VERIFY_TOKEN`).
- Inbound receipt images are queued (`App\Jobs\ProcessWhatsAppReceipt`) so the webhook returns 200 fast and OCR runs on the worker.

### Meta app setup

1. developers.facebook.com → **Create App** → *Business* → use case **Connect with customers through WhatsApp**.
2. **WhatsApp → API Setup**: copy `Phone Number ID` and generate a permanent **System User** access token in Business Settings.
3. **App Settings → Basic**: copy `App ID` and `App Secret`.
4. **WhatsApp → Configuration**: Callback URL = `https://najenga.okjtech.co.ke/api/whatsapp/webhook`, Verify Token = your chosen string. Subscribe to the `messages` field.
5. Fill env vars, redeploy.

## Deployment

Now uses `rsync --delete` (backend) and `rsync` (public), touches `index.php` to bust OPcache, and probes `/health` with 5 retries before declaring success. On failure it prints the last 200 log lines and the `.env` presence check.
