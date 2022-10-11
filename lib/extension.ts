import {
  Config,
  OutputFields,
  insertBefore,
  isSelect,
  change,
  toCountry,
  //addressRetrieval,
  toElem,
  CountryIso,
  Country,
  hide,
  show,
    getParent
} from "@ideal-postcodes/jsutil";
import { AddressFinder } from "@ideal-postcodes/address-finder";
import { watch } from "@ideal-postcodes/postcode-lookup";
import { Address } from "@ideal-postcodes/api-typings";

type SupportedCountry = CountryIso | Country;

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

export const insertPostcodeField = (targets: OutputFields): HTMLElement | null => {
  const line_1 = toElem(targets.line_1 as string, document);
  if (line_1 === null) return null;
  const target = getParent(line_1, "div", (el) => el.classList.contains("form-group"));
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
  targets: OutputFields
): HTMLElement | null => {
  const line_1 = toElem(targets.line_1 as string, document);
  if (line_1 === null) return null;
  const target = line_1.parentElement?.parentElement;
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
  outputFields: OutputFields,
  activate: any,
  deactivate: any
) => {
  const country = toElem(outputFields.country as string, document);
  if (country === null) return NOOP;
  const checkCountry = () => {
    if (countryIsSupported(country as HTMLSelectElement)) return activate();
    deactivate();
  };
  country.addEventListener("change", checkCountry);
  return checkCountry;
};

export const setupShippingPostcodeLookup = (
  config: Config,
  targets: OutputFields,
  pageTest: any,
  getScope?: any
) => {
  if (config.postcodeLookup !== true) return;
  const bind = watch({
    context: "div.idpc_lookup",
    apiKey: config.apiKey,
    inputClass: "form-control",
    buttonClass: "btn btn-primary idpc-button",
    selectClass: "form-control",
    checkKey: true,
    outputFields: targets,
    inputStyle: {
      marginBottom: "15px"
    },
    buttonStyle: {
      marginBottom: "15px"
    },
    populateOrganisation: true,
    removeOrganisation: false,
    onLoaded () {
      setTimeout(() => {
        const label = addLookupLabel(
          this.context,
          "col-sm-2 control-label"
        );
        watchCountry(
          targets,
          () => {
            label.hidden = false;
            bind.controller && show(bind.controller.context);
          },
          () => {
            label.hidden = true;
            bind.controller && hide(bind.controller.context);
          }
        )();
      }, 0);
    },
    onAddressSelected: (address: any) => {
      setTimeout(() => {
        updateCountry(address, toElem(targets.country as string, document));
        updateCounty(address, toElem(targets.county as string, document));
      }, 200);
    },
  }, {
    pageTest,
    getScope,
    onAnchorFound: (options) => {
      const { scope } = options;
      if(scope?.querySelector('.idpc_lookup[idpc="true"]')) return;
      //@ts-ignore
      options.config.context = insertShippingPostcodeFields(targets);
    }
  });
};

export const setupPostcodeLookup = (config: Config, targets: OutputFields, pageTest: any, getScope?: any) => {
  if (config.postcodeLookup !== true) return;
  const bind = watch({
    context: "div.idpc_lookup",
    apiKey: config.apiKey,
    inputClass: "form-control",
    buttonClass: "btn btn-primary idpc-button",
    selectClass: "form-control",
    checkKey: true,
    outputFields: targets,
    inputStyle: {
      marginBottom: "15px"
    },
    buttonStyle: {
      marginBottom: "15px"
    },
    populateOrganisation: true,
    removeOrganisation: false,
    onLoaded () {
      setTimeout(() => {
        // Add search label
        const label = addLookupLabel(this.context);
        watchCountry(
          targets,
          () => {
            label.hidden = false;
            bind.controller && show(bind.controller.context);
          },
          () => {
            label.hidden = true;
            bind.controller && hide(bind.controller.context);
          }
        )();
      }, 0);
    },
    onAddressSelected: (address: any) => {
      setTimeout(() => {
        updateCountry(address, toElem(targets.country as string, document));
        updateCounty(address, toElem(targets.county as string, document));
      }, 200);
    },
  }, {
    pageTest,
    getScope,
    //@ts-expect-error
    anchor: targets.line_1,
    onAnchorFound: (options) => {
      const { scope } = options;
      if(scope?.querySelector('.idpc_lookup[idpc="true"]')) return;
      //@ts-ignore
      options.config.context = insertPostcodeField(targets);
    }
  });
};

export const setupAutocomplete = (config: Config, targets: OutputFields, pageTest: any, getScope?: any) => {
  if (config.autocomplete !== true) return;
  if (targets.line_1 === null) return;
  const controller = AddressFinder.watch({
    apiKey: config.apiKey,
    checkKey: true,
    populateOrganisation: true,
    removeOrganisation: false,
    onLoaded: () => {
      watchCountry(
        targets,
        () => attachAutocomplete(controller),
        () => detachAutocomplete(controller)
      )();
    },
    outputFields: targets,
    onAddressRetrieved: (address: any) => {
      setTimeout(() => {
        updateCountry(address, toElem(targets.country as string, document));
        updateCounty(address, toElem(targets.county as string, document));
      }, 200);
    },
  }, {
    pageTest,
    getScope,
    marker: "idpc-af"
  });
};


const updateCountry = (address: Address, e: HTMLElement | null): void => {
  if (!isSelect(e)) return;
  // @ts-expect-error
  const country = toCountry(address);
  if (country === null) return;
  const value = optionValueByText(e, country);
  if (value) change({ e, value });
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
