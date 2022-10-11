import { getParent, Config } from "@ideal-postcodes/jsutil";

import { setupAutocomplete, setupPostcodeLookup } from "./extension";

export const selectors = {
  line_1: "#input-payment-address-1",
  line_2: '[name="address_2"]',
  postcode: '[name="postcode"]',
  post_town: '[name="city"]',
  organisation_name: '[name="company"]',
  county: '[name="zone_id"]',
  country: '[name="country_id"]',
};

const getScope = (anchor: any) => getParent(anchor, "fieldset", (e) => e.id === "address");

export const pageTest = () => window.location.href.includes("/checkout");

const bind = (config: Config) => {
  setupAutocomplete(config, selectors, pageTest, getScope);
  setupPostcodeLookup(config, selectors, pageTest, getScope);
};

export const bindings = { bind };
