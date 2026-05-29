import { test, expect } from '@playwright/test';

// Fail fast if API_KEY is missing - avoids confusing failures later
if (!process.env.API_KEY) {
  throw new Error('API_KEY environment variable is required');
}

test.describe('Admin', () => {
  const apiKey = process.env.API_KEY!;
  // Token requires sequential execution (enforced in playwright.config.ts)
  let token: string;

  test.beforeEach(async ({ page }) => {
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

    // Save configuration - redirects to extension list on success
    await page.locator('button.btn.btn-primary[title="Save"]').click();
    
    // Wait for redirect to extension list (confirms save succeeded)
    await page.waitForURL(/route=marketplace\/extension/, { timeout: 10000 });
    
    // Navigate back to config and verify
    await extensionLink.click();
    await page.locator('ul.nav-tabs a:has-text("Advanced")').click();
    await expect(page.locator('textarea[name="idealpostcodes_autocomplete_override"]')).toHaveValue('{ "defaultCountry": "GBR", "detectCountry": false }');
  });
});
