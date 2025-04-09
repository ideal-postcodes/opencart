import {
  Config,
  OutputFields,
  insertBefore,
  isSelect,
  //change,
  //toCountry,
  //addressRetrieval,
  toElem,
  hide,
  show,
  getParent,
  AnyAddress as Address
} from "@ideal-postcodes/jsutil";
import { AddressFinder } from "@ideal-postcodes/address-finder";
import { watch } from "@ideal-postcodes/postcode-lookup";

type SupportedCountry = string;

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
  // Find parent row or form element - Bootstrap 5 uses 'row mb-3' instead of 'form-group'
  const target = getParent(line_1, "div", (el) => el.classList.contains("row"));
  if (target === null) return null;
  const formGroup = document.createElement("div");
  formGroup.className = "row mb-3";
  const postcodeField = document.createElement("div");
  postcodeField.className = "idpc_lookup";
  formGroup.appendChild(postcodeField);
  insertBefore({ target, elem: formGroup });
  return postcodeField;
};

export const insertShippingPostcodeFields = (
  targets: OutputFields,
  account:boolean = false
): HTMLElement | null => {
  const line_1 = toElem(targets.line_1 as string, document);
  if (line_1 === null) return null;
  const target = line_1.parentElement?.parentElement;
  if (!target) return null;

  const formGroup = document.createElement("div");
  formGroup.className = account ? "row mb-3" : "row";
  const postcodeField = document.createElement("div");
  // Create column structure for Bootstrap 5
  if(account === false) {
    const col = document.createElement("div");
    col.className = "col mb-3";
    formGroup.appendChild(col);
    postcodeField.className = "idpc_lookup";
    col.appendChild(postcodeField);
  } else {
    postcodeField.className = "col-sm-10 idpc_lookup";
    formGroup.appendChild(postcodeField);
  }

  insertBefore({ target, elem: formGroup });

  return postcodeField;
};

export const addLookupLabel = (
  postcodeField: HTMLElement,
  className = "col-form-label"
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
  getScope?: any,
  account: boolean = false
) => {
  if (config.postcodeLookup !== true) return;
  watch({
    context: "div.idpc_lookup",
    apiKey: config.apiKey,
    inputClass: "form-control",
    buttonClass: "btn btn-primary idpc-button",
    selectClass: "form-select",
    checkKey: true,
    outputFields: targets as any,
    inputStyle: {
      marginBottom: "15px"
    },
    buttonStyle: {
      marginBottom: "15px"
    },
    removeOrganisation: false,
    onLoaded: function() {
      setTimeout(() => {
        const label = addLookupLabel(
          this.context,
          account ? "col-sm-2 col-form-label" : "col-form-label"
        );
        watchCountry(
          targets,
          () => {
            label.hidden = false;
            show(this.context);
          },
          () => {   
            label.hidden = true;
            hide(this.context);
          }
        )();
      }, 0);
    },
    onAddressPopulated: function (address) {
      setTimeout(() => {
        updateCounty(address, this.options.outputFields.county_code as string);
      }, 300);
    }
  }, {
    pageTest,
    getScope,
    anchor: targets.line_1 as string,
    onAnchorFound: (options) => {
      const { scope } = options;
      if(scope?.querySelector('.idpc_lookup[idpc="true"]')) return;
      //@ts-ignore
      options.config.context = insertShippingPostcodeFields(targets, account);
    }
  });
};

export const setupPostcodeLookup = (config: Config, targets: OutputFields, pageTest: any, getScope?: any) => {
  if (config.postcodeLookup !== true) return;
  watch({
    context: "div.idpc_lookup",
    apiKey: config.apiKey,
    inputClass: "form-control",
    buttonClass: "btn btn-primary idpc-button",
    selectClass: "form-select",
    checkKey: true,
    outputFields: targets as any,
    inputStyle: {
      marginBottom: "15px"
    },
    buttonStyle: {
      marginBottom: "15px"
    },
    removeOrganisation: false,
    onLoaded: function () {
      setTimeout(() => {
        // Add search label
        const label = addLookupLabel(this.context, "form-label");
        watchCountry(
          targets,
          () => {
            label.hidden = false;
            show(this.context);
          },
          () => {
            label.hidden = true;
            hide(this.context);
          }
        )();
      }, 0);
    },
    onAddressPopulated: function (address) {
      setTimeout(() => {
        updateCounty(address, this.options.outputFields.county_code as string);
      }, 300);
    }
  }, {
    pageTest,
    getScope,
    anchor: targets.line_1 as string,
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
  
  
  // Initialize Address Finder with proper callbacks
  return AddressFinder.watch({
    apiKey: config.apiKey,
    checkKey: true,
    populateOrganisation: true,
    removeOrganisation: false,
    outputFields: targets,
    onAddressPopulated: function (address) {
      setTimeout(() => {
        updateCounty(address, this.options.outputFields.county_code as string);
      }, 300);
    },
    onContextChange: function(contextIso3) {
      
        // When Address Finder context changes, update country select
        const countrySelect = document.querySelector(targets.country as string);
        if (countrySelect && isSelect(countrySelect as HTMLElement)) {
          const select = countrySelect as HTMLSelectElement;
          // Get current value to check if we need to update
          const currentValue = select.value;
          
          // Try to find matching country code in options
          let found = false;
          let newValue = '';
          
          // Check if option with exact value exists
          Array.from(select.options).forEach((option) => {
            // Check if option value matches ISO3 code
            if (option.value.toUpperCase() === contextIso3) {
              newValue = option.value;
              found = true;
            }
          });
          
          // If not found, try to match by option text
          if (!found) {
            // Get current context details
            const currentContext = this.currentContext();
            if (currentContext) {
              // Try to find by country name
              const matchingOptions = optionsHasText(select, currentContext.description);
              if (matchingOptions.length > 0) {
                newValue = matchingOptions[0].value;
                found = true;
              }
            }
          }
          
          // Only update if we found a match and it's different from current value
          if (found && newValue !== currentValue) {
            select.value = newValue;
            
            // Trigger change event
            const event = new Event('change', { bubbles: true });
            select.dispatchEvent(event);
          } else if (found) {
            // Value already correct, no change needed
          } else {
            console.warn('No matching option found for context:', contextIso3);
          }
        }
    },
    onMounted: function() {
      // 'this' refers to the controller instance
      
      // Get country field
      const countrySelect = document.querySelector(targets.country as string);
      if (!countrySelect) {
        console.warn('Country select element not found:', targets.country);
        return;
      }

      // Get country name from selected option
      if (!isSelect(countrySelect as HTMLElement)) {
        console.warn('Country element is not a select element:', targets.country);
        return;
      }

      // Define a function to handle country changes
      const updateAddressFinderContext = () => {
        const selectElement = countrySelect as HTMLSelectElement;
        const countryValue = selectElement.value;
        const selectedOption = selectElement.options[selectElement.selectedIndex];
        const countryText = selectedOption ? selectedOption.text : '';
          
        if (!countryValue) {
          console.warn('No country value selected');
          return;
        }
        
        // Get available contexts
        const contexts = this.options.contexts;
        if (!contexts) {
          console.warn('No contexts available in Address Finder');
          return;
        }
        
        let contextDetails;
        
        // First try to match by ISO3 code
        for (const key in contexts) {
          if (key === countryValue.toUpperCase()) {
            contextDetails = contexts[key];
            break;
          }
        }
          
        // If no match by ISO3, try to match by name
        if (!contextDetails) {
          for (const key in contexts) {
            const context = contexts[key];
            if (context && context.description && 
                context.description.toLowerCase() === countryText.toLowerCase()) {
              contextDetails = context;
              break;
            }
          }
        }
        
        // Apply the context if found
        if (contextDetails) {
          // Check if this is already the current context to prevent loops
          const currentContext = this.currentContext();
          if (currentContext && currentContext.iso_3 === contextDetails.iso_3) {
            // Context already set correctly, no update needed
          } else {
            try {
              this.applyContext(contextDetails);
            } catch (error) {
              console.error('Error applying context:', error);
            }
          }
        } else {
          console.warn('Could not find matching context for country:', countryValue, countryText);
        }
      };
      
      // Add event listener for future changes - arrow function preserves 'this'
      countrySelect.addEventListener('change', updateAddressFinderContext);
      
      // Immediately update context based on current select value
      // Slight delay to ensure everything is initialized
      setTimeout(updateAddressFinderContext, 300);
    }
  }, {
    pageTest,
    getScope,
    marker: "idpc-af"
  });
};


const hasValue = (select: HTMLSelectElement, value: string): boolean => {
  const options = Array.from(select.options);
  return options.some((o) => o.value === value);
};

const optionsHasText = (select: HTMLSelectElement, text: string): Array<HTMLOptionElement> => {
  if (!text) return [];
  const options = Array.from(select.options);
  return options.filter((o) => {
    const optionText = o.text.toLowerCase();
    return optionText.indexOf(text.toLowerCase()) !== -1;
  });
};

const updateCounty = (address: Address, select: HTMLSelectElement | string |null) => {
  if (select === null) return;
  const e = typeof select === 'string' ? document.querySelector(select) as HTMLSelectElement : select;
  if (!isSelect(e)) return;
  
  // Get county values from address object
  //@ts-expect-error
  const countyIsoValue = address.county_code || "";
  let countyValue = address.county || "";
  if (countyValue === "London") countyValue = "Greater London";
  

  
  if (isSelect(e)) {
    // First try exact ISO code match if available
    if (countyIsoValue !== "" && hasValue(e, countyIsoValue)) {
      e.value = countyIsoValue;
      return;
    }
    
    // Then try exact county name match
    else if (countyValue !== "" && hasValue(e, countyValue)) {
      e.value = countyValue;
      return;
    }
    
    // Then try text-based matching for county name
    else if (countyValue) {
      const textMatches = optionsHasText(e, countyValue);
      if (textMatches.length > 0) {
        e.value = textMatches[0].value;
        return;
      }
    }
    
    // Finally try text-based matching for county ISO
    if (countyIsoValue) {
      const isoMatches = optionsHasText(e, countyIsoValue);
      if (isoMatches.length > 0) {
        e.value = isoMatches[0].value;
        return;
      }
    }
    
    // If still not found, try additional county types
    const additionalTypes = [
      "post_town",
      "traditional_county",
      "administrative_county"
    ];
    
    for (const type of additionalTypes) {
      // @ts-expect-error
      const value = address[type];
      if (typeof value === "string" && value) {
        const matches = optionsHasText(e, value);
        if (matches.length > 0) {
          e.value = matches[0].value;
          return;
        }
      }
    }
  }
};
