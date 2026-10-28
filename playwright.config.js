import { defineConfig, devices } from '@playwright/test';

/*
 * Visual regression tests (tests/visual): screenshots of the dashboard shell,
 * the floating toolbar and a list page in the dark theme, compared with the
 * baselines committed next to the specs. Runs against a local server on a
 * throwaway SQLite database seeded with fixed data (VisualTestSeeder).
 *
 *   npm run test:visual            compare with the baselines
 *   npm run test:visual -- -u      write new baselines
 *
 * Baselines are made on CI (ubuntu, the Visual workflow): fonts differ from
 * one machine to another, so baselines from a laptop won't match.
 */
const PORT = 8010;

export default defineConfig({
    testDir: 'tests/visual',
    fullyParallel: false,
    workers: 1,
    retries: 0,
    reporter: [['list'], ['html', { open: 'never', outputFolder: 'storage/playwright-report' }]],
    outputDir: 'storage/playwright-results',
    expect: {
        toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: 'disabled', caret: 'hide' },
    },
    use: {
        baseURL: `http://127.0.0.1:${PORT}`,
        colorScheme: 'dark',
        locale: 'en-GB',
        timezoneId: 'Africa/Nairobi',
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
    },
    webServer: {
        command: `touch database/visual.sqlite && php artisan migrate:fresh --seed --seeder=VisualTestSeeder --force && php artisan serve --host=127.0.0.1 --port=${PORT}`,
        url: `http://127.0.0.1:${PORT}/login`,
        reuseExistingServer: false,
        timeout: 120_000,
        env: {
            APP_ENV: 'local',
            DB_CONNECTION: 'sqlite',
            DB_DATABASE: 'database/visual.sqlite',
            SESSION_DRIVER: 'file',
            CACHE_STORE: 'array',
            QUEUE_CONNECTION: 'sync',
        },
    },
});
