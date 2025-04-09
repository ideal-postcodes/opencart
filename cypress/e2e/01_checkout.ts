/// <reference types="cypress" />
// Uncaught exceptions are now handled in support/e2e.ts

import { address as addresses } from "@ideal-postcodes/api-fixtures";
import {
  autocompleteSuite,
  postcodeLookupSuite,
} from "../support/suite";
import { selectors } from "../../lib/shipping";

const address = addresses.jersey;
const suite = {
  scope: "#shipping-address",
  selectors,
  address,
};

describe("Checkout", () => {
  beforeEach(() => {
    // Add product and visit checkout
    cy.visit("/index.php?route=product/product&product_id=43");
    cy.get("button").contains("Add to Cart").click();
    cy.get(".alert.alert-success").should(
      "contain.text",
      "Success: You have added"
    );
    cy.intercept("GET", "https://api.ideal-postcodes.co.uk/v1/keys/*").as("keys");
    cy.visit("/index.php?route=checkout/checkout");
    cy.wait("@keys");
    cy.get("label").contains("Guest Checkout").click();
    cy.get("#shipping-address").should("be.visible");
    cy.wait(1000); // Reduced wait time
  });

  postcodeLookupSuite(suite);
  autocompleteSuite(suite);
});
