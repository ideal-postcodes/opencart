import { Config } from "@ideal-postcodes/jsutil";
import { selectors as billingSelectors } from "./billing";
import { setupAutocomplete, setupShippingPostcodeLookup } from "./extension";

const selectors = {
  ...billingSelectors,
  line_1: "#input-address-1",
};

const getScope = undefined;

export const pageTest = () => window.location.href.includes("/address");

const bind = (config: Config) => {
  setupAutocomplete(config, selectors, pageTest, getScope);
  setupShippingPostcodeLookup(config, selectors, pageTest, getScope);
};

export const bindings = { bind };