import { test, expect } from '@playwright/test';

/*
 * The dashboard shell, the floating toolbar and a list page, in the dark
 * theme, on fixed data (VisualTestSeeder). Fonts from the web are blocked
 * so the system fonts render the same on every run.
 */

test.beforeEach(async ({ page }) => {
    await page.route(/fonts\.(bunny\.net|googleapis\.com|gstatic\.com)/, (route) => route.abort());
    // Presence: nobody else online, no badges.
    await page.route('**/presence/heartbeat', (route) => route.fulfill({ json: { online: [], badges: {} } }));

    await page.goto('/login');
    await page.fill('#email', 'visual@example.com');
    await page.fill('input[type=password]', 'password');
    await Promise.all([page.waitForURL((url) => !url.pathname.startsWith('/login')), page.click('button[type=submit]')]);
});

async function open(page, path) {
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => document.fonts.ready);
}

test('the shell and the Expenses list', async ({ page }) => {
    await open(page, '/expenses');
    await expect(page).toHaveScreenshot('expenses.png');
});

test('the floating toolbar', async ({ page }) => {
    await open(page, '/expenses');
    await expect(page.getByRole('toolbar', { name: 'Page tools' })).toHaveScreenshot('toolbar.png');
});

test('the floating toolbar with a selection', async ({ page }) => {
    await open(page, '/expenses');
    await page.getByRole('checkbox', { name: /Select all/ }).check();
    await expect(page.getByRole('toolbar', { name: 'Page tools' })).toHaveScreenshot('toolbar-selection.png');
});

test('the Projects list', async ({ page }) => {
    await open(page, '/projects');
    await expect(page).toHaveScreenshot('projects.png');
});

test('the shell on a phone', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, '/expenses');
    await expect(page).toHaveScreenshot('expenses-phone.png');
});
