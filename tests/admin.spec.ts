import { test, expect } from '@playwright/test';

const activateExtension = async (page: any, token: string) => {
  // Account layout
  await page.goto(`/admin/index.php?route=design/layout.form&user_token=${token}&layout_id=6`);
  const accountModuleContent = page.locator('#module-content-top');
  await accountModuleContent.locator("button[title='Add Module']").click();
  await accountModuleContent.locator('select').selectOption('idealpostcodes.ukaddresssearch');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.locator('button[type="submit"][form="form-layout"]').click();

  // Checkout layout
  await page.goto(`/admin/index.php?route=design/layout.form&user_token=${token}&layout_id=7`);
  const checkoutModuleContent = page.locator('#module-content-top');
  await checkoutModuleContent.locator("button[title='Add Module']").click();
  await checkoutModuleContent.locator('select').selectOption('idealpostcodes.ukaddresssearch');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.locator('button[type="submit"][form="form-layout"]').click();
};

test.describe('Admin', () => {
  const apiKey = process.env.API_KEY || '';
  let token: string;

  test.beforeEach(async ({ page, baseURL }) => {
    if (token) return;

    await page.goto('/admin');
    await page.locator('#input-username').fill('admin');
    await page.locator('#input-password').fill('password');
    await page.locator('form').getByText('Login').click();
    await expect(page).toHaveURL(/\/admin\/index\.php\?route=common\/dashboard&user_token=/);

    const url = new URL(page.url());
    token = url.searchParams.get('user_token') || '';
  });

  test.afterAll(async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Login again for cleanup
    await page.goto('/admin');
    await page.locator('#input-username').fill('admin');
    await page.locator('#input-password').fill('password');
    await page.locator('form').getByText('Login').click();
    await expect(page).toHaveURL(/\/admin\/index\.php\?route=common\/dashboard&user_token=/);
    
    const url = new URL(page.url());
    const newToken = url.searchParams.get('user_token') || '';
    await activateExtension(page, newToken);
    await context.close();
  });

  test('Can navigate to config page', async ({ page, baseURL }) => {
    await page.goto(`/admin/index.php?route=marketplace/extension&user_token=${token}`);
    await page.locator('select[name="type"]').selectOption(`${baseURL}/admin/index.php?route=extension/module&user_token=${token}`);
    await page.waitForTimeout(2000);
    await page.locator(`a[href="${baseURL}/admin/index.php?route=extension/idealpostcodes/module/ukaddresssearch&user_token=${token}"]`).click();

    // Fill configuration data
    await page.locator('select[name="idealpostcodes_enabled"]').selectOption('1');
    await page.locator('input[name="idealpostcodes_api_key"]').clear();
    await page.locator('input[name="idealpostcodes_api_key"]').fill(apiKey);

    // Add advanced configuration after tab click
    await page.locator('ul.nav-tabs a:has-text("Advanced")').click();

    // Set Address Finder Configuration Override
    await page.locator('textarea[name="idealpostcodes_autocomplete_override"]').clear();
    await page.locator('textarea[name="idealpostcodes_autocomplete_override"]').fill('{ "defaultCountry": "GBR", "detectCountry": false }');

    // Save configuration
    await page.locator('button.btn.btn-primary[title="Save"]').click();

    // Verify configuration was saved
    await page.waitForTimeout(1000);
    await page.locator(`a[href="${baseURL}/admin/index.php?route=extension/idealpostcodes/module/ukaddresssearch&user_token=${token}"]`).click();

    // Verify the configuration values
    await page.locator('ul.nav-tabs a:has-text("Advanced")').click();
    await expect(page.locator('textarea[name="idealpostcodes_autocomplete_override"]')).toHaveValue('{ "defaultCountry": "GBR", "detectCountry": false }');
  });
});
