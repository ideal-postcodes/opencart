import { setupBind, Binding, Config } from "@ideal-postcodes/jsutil";
import { selectors as billingSelectors, pageTest } from "./billing";
import { setupAutocomplete, setupShippingPostcodeLookup } from "./extension";

const selectors = {
  ...billingSelectors,
  line_1: "#input-shipping-address-1",
};

const bind = (config: Config) => {
  setupBind({
    selectors,
    parentScope: "div",
    parentTest: (e) => e.id === "collapse-shipping-address",
  }).forEach(({ targets }) => {
    setupAutocomplete(config, targets);
    setupShippingPostcodeLookup(config, targets);
  });
};

export const bindings: Binding = { bind, pageTest };
