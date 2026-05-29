import { test, expect } from '@playwright/test';
import { address as addresses } from '@ideal-postcodes/api-fixtures';
import { runAutocompleteSuite, runPostcodeLookupSuite, Suite } from './helpers/suite';
import { selectors } from '../lib/shipping';

const address = addresses.jersey;
const suite: Suite = {
  scope: '#shipping-address',
  selectors,
  address,
};

test.describe('Checkout', () => {
  test.beforeEach(async ({ page }) => {
    // Add product and visit checkout
    await page.goto('/index.php?route=product/product&product_id=43');
    await page.locator('button').filter({ hasText: 'Add to Cart' }).click();
    await expect(page.locator('.alert.alert-success')).toContainText('Success: You have added');

    await page.goto('/index.php?route=checkout/checkout');
    await page.locator('label').filter({ hasText: 'Guest Checkout' }).click();
    await expect(page.locator('#shipping-address')).toBeVisible();
    
    // Wait for extension widget to be injected into DOM (hidden until UK selected)
    await expect(page.locator('#shipping-address .idpc_lookup')).toBeAttached({ timeout: 15000 });
  });

  test('Postcode Lookup', async ({ page }) => {
    await runPostcodeLookupSuite(page, suite);
  });

  test('Autocomplete', async ({ page }) => {
    await runAutocompleteSuite(page, suite);
  });
});
