import { Config } from "@ideal-postcodes/jsutil";
import { setupAutocomplete, setupShippingPostcodeLookup } from "./extension";

const selectors = {
  line_1: "#input-address-1",
  line_2: '#input-address-2',
  postcode: '#input-postcode',
  post_town: '#input-city',
  organisation_name: '#input-company',
  county_code: '#input-zone',
  country: '#input-country',
};

const getScope = undefined;

export const pageTest = () => window.location.href.includes("/address");

const bind = (config: Config) => {
  setupAutocomplete(config, selectors, pageTest, getScope);
  setupShippingPostcodeLookup(config, selectors, pageTest, getScope, true);
};

export const bindings = { bind };