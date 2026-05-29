import { test, expect } from '@playwright/test';

// Fail fast if API_KEY is missing - avoids confusing failures later
if (!process.env.API_KEY) {
  throw new Error('API_KEY environment variable is required');
}

test.describe('Admin', () => {
  const apiKey = process.env.API_KEY!;
  // Module-scoped token works because workers:1 and fullyParallel:false.
  // If parallelism is enabled, convert to a worker-scoped fixture.
  let token: string;

  test.beforeEach(async ({ page, baseURL }) => {
    if (token) return;

    await page.goto('/admin');
    await page.locator('#input-username').fill('admin');
    await page.locator('#input-password').fill('password');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/\/admin\/index\.php\?route=common\/dashboard&user_token=/);

    const url = new URL(page.url());
    const t = url.searchParams.get('user_token');
    if (!t) throw new Error('user_token missing from admin URL');
    token = t;
  });


  test('Can navigate to config page', async ({ page, baseURL }) => {
    await page.goto(`/admin/index.php?route=marketplace/extension&user_token=${token}`);
    await page.locator('select[name="type"]').selectOption(`${baseURL}/admin/index.php?route=extension/module&user_token=${token}`);
    // Wait for extension list to load after type selection
    // Use suffix selector to handle both relative and absolute hrefs
    const extensionLink = page.locator(`a[href$="route=extension/idealpostcodes/module/ukaddresssearch&user_token=${token}"]`);
    await expect(extensionLink).toBeVisible();
    await extensionLink.click();

    // Fill configuration data
    await page.locator('select[name="idealpostcodes_enabled"]').selectOption('1');
    await page.locator('input[name="idealpostcodes_api_key"]').clear();
    await page.locator('input[name="idealpostcodes_api_key"]').fill(apiKey);

    // Add advanced configuration after tab click
    await page.locator('ul.nav-tabs a:has-text("Advanced")').click();

    // Set Address Finder Configuration Override
    await page.locator('textarea[name="idealpostcodes_autocomplete_override"]').clear();
    await page.locator('textarea[name="idealpostcodes_autocomplete_override"]').fill('{ "defaultCountry": "GBR", "detectCountry": false }');

    // Save configuration - this redirects back to extension list
    await page.locator('button.btn.btn-primary[title="Save"]').click();

    // Wait for redirect to complete and navigate back to config
    await expect(extensionLink).toBeVisible({ timeout: 10000 });
    await extensionLink.click();

    // Verify the configuration values
    await page.locator('ul.nav-tabs a:has-text("Advanced")').click();
    await expect(page.locator('textarea[name="idealpostcodes_autocomplete_override"]')).toHaveValue('{ "defaultCountry": "GBR", "detectCountry": false }');
  });
});
