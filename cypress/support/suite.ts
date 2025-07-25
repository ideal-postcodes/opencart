import { Selectors } from "@ideal-postcodes/jsutil";
import { Address } from "@ideal-postcodes/api-typings";

interface Suite {
  scope: string;
  selectors: Selectors;
  address: Address;
}

const normalizeCity = (city: string): string => {
  const lowerCase = city.toLowerCase();
  return lowerCase.charAt(0).toUpperCase() + lowerCase.slice(1);
}

const assertions = (
  scope: JQuery<HTMLElement>,
  selectors: Selectors,
  address: Address
) => {
  cy.get(selectors.line_1).should("have.value", address.line_1);
  if (selectors.line_3 && scope.find(selectors.line_3).length > 0) {
    selectors.line_2 &&
      cy.get(selectors.line_2).should("have.value", `${address.line_2}`);
    selectors.line_3 &&
      cy.get(selectors.line_3).should("have.value", `${address.line_3}`);
  } else {
    selectors.line_2 &&
      cy
        .get(selectors.line_2)
        .should("have.value", `${address.line_2}, ${address.line_3}`);
  }

  selectors.organisation &&
    cy
      .get(selectors.organisation)
      .should("have.value", address.organisation_name);
  cy.get(selectors.post_town).should("have.value", normalizeCity(address.post_town));
  cy.get(selectors.country).should("have.value", "257");
  cy.get(selectors.postcode).should("have.value", address.postcode);
};

export const autocompleteSuite = (suite: Suite) => {
  const scope = suite.scope;
  const selectors = suite.selectors;
  const address = suite.address;

  it("Autocomplete", () => {
    cy.get(scope).within(($scope) => {
    const scope = $scope;
      cy.get(selectors.country).select("222");
      cy.wait(1000);
      cy.get(selectors.line_1)
        .clear({
          force: true,
        })
        .type(address.line_1, {
          force: true,
        });
      cy.wait(2000);
      cy.get(".idpc_ul li").first().click({ force: true });
      assertions(scope, selectors, address);
    });
  });
};

export const postcodeLookupSuite = (suite: Suite) => {
  const scope = suite.scope;
  const selectors = suite.selectors;
  const address = suite.address;

  it("Postcode Lookup", () => {
    cy.get(scope).within(($scope) => {
    const scope = $scope;
      cy.get(selectors.country).select("222");
      cy.wait(1000);
      cy.get(".idpc_lookup input.form-control")
        .clear({
          force: true,
        })
        .type(address.postcode, {
          force: true,
        });
      cy.get(".idpc-button").click({ force: true });
      cy.wait(1000);
      cy.get(".idpc-select-container select").select("0");
      assertions(scope, selectors, address);
    });
  });
};
