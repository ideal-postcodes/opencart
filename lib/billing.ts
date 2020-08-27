import { setupBind, Config } from "@ideal-postcodes/jsutil";

import { setupAutocomplete, setupPostcodeLookup } from "./extension";

export const selectors = {
  line_1: "#input-payment-address-1",
  line_2: '[name="address_2"]',
  postcode: '[name="postcode"]',
  post_town: '[name="city"]',
  organisation: '[name="company"]',
  county: '[name="zone_id"]',
  country: '[name="country_id"]',
};

const bind = (config: Config) => {
  setupBind({
    selectors,
    parentScope: "fieldset",
    parentTest: (e) => e.id === "address",
  }).forEach(({ targets }) => {
    setupAutocomplete(config, targets);
    setupPostcodeLookup(config, targets);
  });
};

export const pageTest = () => window.location.href.includes("/checkout");

export const bindings = { bind, pageTest };
