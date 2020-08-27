/// <reference types="cypress" />;

Cypress.on("uncaught:exception", (err) => {
  console.log(err);
  return false;
});

import { address as addresses } from "@ideal-postcodes/api-fixtures";
import {
  autocompleteSuite,
  postcodeLookupSuite,
} from "../support/suite";
import { selectors } from "../../lib/billing";

const address = addresses.jersey;
const suite = {
  scope: "#address",
  selectors,
  address,
};

describe("Checkout", () => {
  before(() => {
    // Add product and visit checkout
    cy.visit("/index.php?route=product/product&product_id=43");
    cy.get("button").contains("Add to Cart").click();
    cy.get(".alert.alert-success").should(
      "contain.text",
      "Success: You have added"
    );
    cy.visit("/index.php?route=checkout/checkout");
    cy.get("label").contains("Guest Checkout").click();
    cy.wait(1000);
    cy.get("#button-account").click();
  });

  postcodeLookupSuite(suite);
  autocompleteSuite(suite);
});
