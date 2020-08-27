declare global {
  interface Window {
    IdealPostcodes: any;
    jQuery: any;
    idpcStart: any;
  }
}

import {
  Config,
  Targets,
  insertBefore,
  isSelect,
  change,
  toCountry,
  addressRetrieval,
  UkCountry,
  CountryIso,
  Country,
} from "@ideal-postcodes/jsutil";
import { Address } from "@ideal-postcodes/api-typings";

type SupportedCountry = UkCountry | CountryIso | Country;

const SUPPORTED_COUNTRIES: SupportedCountry[] = [
  "England",
  "Scotland",
  "Wales",
  "Northern Ireland",
  "Channel Islands",
  "Isle of Man",
  "United Kingdom",
  "Jersey",
  "Guernsey",
  "GB",
  "IM",
  "JE",
  "GG",
];

export const countryIsSupported = (e: HTMLSelectElement): boolean => {
  const index = e.selectedIndex;
  const country = e.options[index].text;
  return SUPPORTED_COUNTRIES.reduce<boolean>((prev, supported) => {
    if (country === supported) return true;
    return prev;
  }, false);
};

export const detachAutocomplete = (instance: any) => {
  const i = instance.interface;
  if (!i) return;
  const input = i.input;

  // Disable current autocomplet activity just in case
  i._onBlurBound();

  // Detact listeners
  input.removeEventListener("input", i._onInputBound);
  input.removeEventListener("blur", i._onBlurBound);
  input.removeEventListener("focus", i._onFocusBound);
  input.removeEventListener("keydown", i._onKeyDownBound);
  i.suggestionList.removeEventListener("mousedown", i._onMousedownBound);
};

export const attachAutocomplete = (instance: any) => {
  if (!instance.interface) return;
  instance.interface.initialiseEventListeners();
};

export const insertPostcodeField = (targets: Targets): HTMLElement | null => {
  if (targets.line_1 === null) return null;
  const target = targets.line_1.parentElement;
  if (target === null) return null;
  const formGroup = document.createElement("div");
  formGroup.className = "form-group";
  const postcodeField = document.createElement("div");
  postcodeField.className = "idpc_lookup";
  formGroup.appendChild(postcodeField);
  insertBefore({ target, elem: formGroup });
  return postcodeField;
};

export const insertShippingPostcodeFields = (
  targets: Targets
): HTMLElement | null => {
  if (targets.line_1 === null) return null;
  const target = targets.line_1.parentElement?.parentElement;
  if (!target) return null;

  const formGroup = document.createElement("div");
  formGroup.className = "form-group";

  const col = document.createElement("div");
  col.className = "col-sm-10";
  formGroup.appendChild(col);

  const postcodeField = document.createElement("div");
  postcodeField.className = "idpc_lookup";
  col.appendChild(postcodeField);

  insertBefore({ target, elem: formGroup });

  return postcodeField;
};

export const addLookupLabel = (
  postcodeField: HTMLElement,
  className = "control-label"
): HTMLLabelElement => {
  const elem = document.createElement("label");
  elem.innerText = "Search your Postcode";
  elem.className = className;
  elem.setAttribute("for", "idpc_postcode_lookup");
  insertBefore({ target: postcodeField, elem });
  return elem;
};

const NOOP = () => {};

export const watchCountry = (
  { country }: Targets,
  activate: any,
  deactivate: any
) => {
  if (!country) return NOOP;
  const checkCountry = () => {
    if (countryIsSupported(country as HTMLSelectElement)) return activate();
    deactivate();
  };
  country.addEventListener("change", checkCountry);
  return checkCountry;
};

export const setupShippingPostcodeLookup = (
  config: Config,
  targets: Targets
) => {
  if (config.postcodeLookup !== true) return;
  const postcodeField = insertShippingPostcodeFields(targets);
  if (postcodeField === null) return;
  const controller = window.jQuery(postcodeField).setupPostcodeLookup({
    api_key: config.apiKey,
    input_class: "form-control",
    button_class: "btn btn-primary idpc-button",
    dropdown_class: "form-control",
    check_key: true,
    onLoaded: () => {
      setTimeout(() => {
        const label = addLookupLabel(
          postcodeField.parentNode as HTMLElement,
          "col-sm-2 control-label"
        );
        watchCountry(
          targets,
          () => {
            label.hidden = false;
            controller.show();
          },
          () => {
            label.hidden = true;
            controller.hide();
          }
        )();
      }, 0);
    },
    onAddressSelected: (address: Address) => {
      addressRetrieval({ config, targets })(address);
      updateCountry(address, targets.country);
      setTimeout(() => updateCounty(address, targets.county), 1000);
    },
  });
};

export const setupPostcodeLookup = (config: Config, targets: Targets) => {
  if (config.postcodeLookup !== true) return;
  const postcodeField = insertPostcodeField(targets);
  if (postcodeField === null) return;
  const controller = window.jQuery(postcodeField).setupPostcodeLookup({
    api_key: config.apiKey,
    input_class: "form-control",
    button_class: "btn btn-primary idpc-button",
    dropdown_class: "form-control",
    check_key: true,
    onLoaded: () => {
      setTimeout(() => {
        // Add search label
        const label = addLookupLabel(postcodeField);
        watchCountry(
          targets,
          () => {
            label.hidden = false;
            controller.show();
          },
          () => {
            label.hidden = true;
            controller.hide();
          }
        )();
      }, 0);
    },
    onAddressSelected: (address: Address) => {
      addressRetrieval({ config, targets })(address);
      updateCountry(address, targets.country);
      setTimeout(() => updateCounty(address, targets.county), 1000);
    },
  });
};

export const setupAutocomplete = (config: Config, targets: Targets) => {
  if (config.autocomplete !== true) return;
  if (targets.line_1 === null) return;
  const controller = new window.IdealPostcodes.Autocomplete.Controller({
    api_key: config.apiKey,
    checkKey: true,
    onLoaded: () => {
      watchCountry(
        targets,
        () => attachAutocomplete(controller),
        () => detachAutocomplete(controller)
      )();
    },
    inputField: targets.line_1,
    onAddressRetrieved: (address: Address) => {
      addressRetrieval({ config, targets })(address);
      updateCountry(address, targets.country);
      setTimeout(() => updateCounty(address, targets.county), 1000);
    },
  });
};

const optionValueByText = (
  select: HTMLSelectElement,
  text: string
): string | null => {
  for (let i = 0; i < select.length; i += 1) {
    if (select.options[i].text.trim() === text) {
      return select.options[i].value;
    }
  }
  return null;
};

const updateCountry = (address: Address, e: HTMLElement | null): void => {
  if (!isSelect(e)) return;
  const country = toCountry(address);
  if (country === null) return;
  const value = optionValueByText(e, country);
  if (value) change({ e, value });
};

const updateCounty = (address: Address, select: HTMLElement | null) => {
  if (select === null) return;
  const e = document.querySelector(`#${select.id}`) as HTMLElement;
  if (!isSelect(e)) return;
  const types: (keyof Address)[] = [
    "county",
    "post_town",
    "traditional_county",
    "administrative_county",
  ];

  for (const t of types) {
    let attr = address[t];
    if (attr === "London") attr = "Greater London";
    if (typeof attr !== "string") continue;
    const value = optionValueByText(e, attr);
    if (value) {
      change({ e, value });
      break;
    }
  }
};
