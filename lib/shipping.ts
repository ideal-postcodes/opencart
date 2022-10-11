import { Config, getParent} from "@ideal-postcodes/jsutil";
import { selectors as billingSelectors, pageTest } from "./billing";
import {setupAutocomplete, setupShippingPostcodeLookup} from "./extension";

const selectors = {
  ...billingSelectors,
  line_1: "#input-shipping-address-1",
};

const getScope = (anchor: any) => getParent(anchor, "div", (e) => e.id === "collapse-shipping-address");

const bind = (config: Config) => {
  setupAutocomplete(config, selectors, pageTest, getScope);
  setupShippingPostcodeLookup(config, selectors, pageTest, getScope);
};

export const bindings = { bind };
