import { Page, expect, Locator } from '@playwright/test';
import { Selectors } from '@ideal-postcodes/jsutil';
import { Address } from '@ideal-postcodes/api-typings';

export interface Suite {
  scope: string;
  selectors: Selectors;
  address: Address;
}

const normalizeCity = (city: string): string => {
  const lowerCase = city.toLowerCase();
  return lowerCase.charAt(0).toUpperCase() + lowerCase.slice(1);
};

const assertions = async (
  scope: Locator,
  selectors: Selectors,
  address: Address
) => {
  await expect(scope.locator(selectors.line_1)).toHaveValue(address.line_1);
  
  const line3Exists = selectors.line_3 && await scope.locator(selectors.line_3).count() > 0;
  
  if (line3Exists) {
    if (selectors.line_2) {
      await expect(scope.locator(selectors.line_2)).toHaveValue(address.line_2);
    }
    if (selectors.line_3) {
      await expect(scope.locator(selectors.line_3)).toHaveValue(address.line_3);
    }
  } else {
    if (selectors.line_2) {
      await expect(scope.locator(selectors.line_2)).toHaveValue(`${address.line_2}, ${address.line_3}`);
    }
  }

  if (selectors.organisation) {
    await expect(scope.locator(selectors.organisation)).toHaveValue(address.organisation_name);
  }
  await expect(scope.locator(selectors.post_town)).toHaveValue(normalizeCity(address.post_town));
  await expect(scope.locator(selectors.country)).toHaveValue('257');
  await expect(scope.locator(selectors.postcode)).toHaveValue(address.postcode);
};

export const runAutocompleteSuite = async (page: Page, suite: Suite) => {
  const { scope: scopeSelector, selectors, address } = suite;
  const scope = page.locator(scopeSelector);

  await scope.locator(selectors.country).selectOption('222');
  await page.waitForTimeout(1000);
  await scope.locator(selectors.line_1).clear();
  await scope.locator(selectors.line_1).fill(address.line_1);
  await page.waitForTimeout(2000);
  await page.locator('.idpc_ul li').first().click();
  await assertions(scope, selectors, address);
};

export const runPostcodeLookupSuite = async (page: Page, suite: Suite) => {
  const { scope: scopeSelector, selectors, address } = suite;
  const scope = page.locator(scopeSelector);

  await scope.locator(selectors.country).selectOption('222');
  await page.waitForTimeout(1000);
  await scope.locator('.idpc_lookup input.form-control').clear();
  await scope.locator('.idpc_lookup input.form-control').fill(address.postcode);
  await scope.locator('.idpc-button').click();
  await page.waitForTimeout(1000);
  await scope.locator('.idpc-select-container select').selectOption('0');
  await assertions(scope, selectors, address);
};
