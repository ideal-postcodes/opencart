import { setupBind, Binding, Config } from "@ideal-postcodes/jsutil";
import { selectors as billingSelectors } from "./billing";
import { setupAutocomplete, setupShippingPostcodeLookup } from "./extension";

const selectors = {
  ...billingSelectors,
  line_1: "#input-address-1",
};

const bind = (config: Config) => {
  setupBind({
    selectors,
  }).forEach(({ targets }) => {
    setupAutocomplete(config, targets);
    setupShippingPostcodeLookup(config, targets);
  });
};

export const pageTest = () => window.location.href.includes("/address");

export const bindings: Binding = { bind, pageTest };
