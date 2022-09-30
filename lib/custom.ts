import { Config, OutputFields } from "@ideal-postcodes/jsutil";

import { setupAutocomplete, setupPostcodeLookup } from "./extension";

export const pageTest = () => true;

interface CustomConfig extends Config {
    customFields?: OutputFields[]
}

const bind = (config: CustomConfig) => {
    const selectors = config.customFields || [];
    selectors.forEach((selectors: OutputFields) => {
        setupAutocomplete(config, selectors, pageTest);
        setupPostcodeLookup(config, selectors, pageTest);
    });
};

export const bindings = { bind };
