import { Config, getParent} from "@ideal-postcodes/jsutil";
import { pageTest } from "./billing";
import {setupAutocomplete, setupShippingPostcodeLookup} from "./extension";

export const selectors = {
  line_1: "#input-shipping-address-1",
  line_2: '#input-shipping-address-2',
  postcode: '#input-shipping-postcode',
  post_town: '#input-shipping-city',
  organisation_name: '#input-shipping-company',
  county_code: '#input-shipping-zone',
  country: '#input-shipping-country',
};

const getScope = (anchor: any) => getParent(anchor, "fieldset", (e) => e.id === "shipping-address");

const bind = (config: Config) => {
  setupAutocomplete(config, selectors, pageTest, getScope);
  setupShippingPostcodeLookup(config, selectors, pageTest, getScope);
};

export const bindings = { bind };
