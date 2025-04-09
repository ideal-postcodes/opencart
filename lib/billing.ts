import { getParent, Config } from "@ideal-postcodes/jsutil";

import { setupAutocomplete, setupPostcodeLookup } from "./extension";

export const selectors = {
  line_1: "#input-payment-address-1",
  line_2: '#input-payment-address-2',
  postcode: '#input-payment-postcode',
  post_town: '#input-payment-city',
  organisation_name: '#input-payment-company',
  county_code: '#input-payment-zone',
  country: '#input-payment-country',
};

const getScope = (anchor: any) => getParent(anchor, "fieldset");

export const pageTest = () => window.location.href.includes("/checkout");

const bind = (config: Config) => {
  setupAutocomplete(config, selectors, pageTest, getScope);
  setupPostcodeLookup(config, selectors, pageTest, getScope);
};

export const bindings = { bind };
