/// <reference types="cypress" />;
Cypress.on("uncaught:exception", (err) => {
  console.log(err);
  return false;
});

const activateExtension = (token:string|null) => {
  //Account
  cy.visit(`/admin/index.php?route=design/layout/edit&user_token=${token}&layout_id=6`);
  cy.get("#module-content-top").within(() => {
    cy.get("select").select("ukaddresssearch");
    cy.get(`button[data-original-title="Add Module"]`).click();
  });
  cy.get(`button[data-original-title="Save"]`).click();
  //Checkout
  cy.visit(`/admin/index.php?route=design/layout/edit&user_token=${token}&layout_id=7`);
  cy.get("#module-content-top").within(() => {
    cy.get("select").select("ukaddresssearch");
    cy.get(`button[data-original-title="Add Module"]`).click();
  });
  cy.get(`button[data-original-title="Save"]`).click();
}

describe("Admin", () => {
  const baseUrl = Cypress.config("baseUrl");
  const apiKey = Cypress.env("API_KEY");
  let token: string|null;

  after(() => activateExtension(token));

  it("Can navigate to config page", () => {
    // Login to admin page
    cy.visit("/admin");
    cy.get("#input-username").type("admin");
    cy.get("#input-password").type("password");
    cy.get("form").contains("Login").click({force:true});
    cy.url().should("include", "/admin/index.php?route=common/dashboard&user_token=");
    cy.window().then((win) => {
      const url = new URL(win.location.href);
      token = url.searchParams.get("user_token");
      cy.visit(`/admin/index.php?route=marketplace/extension&user_token=${token}`);
      cy.get("select[name=\"type\"]").select(`${baseUrl}/admin/index.php?route=extension/extension/module&user_token=${token}`);
      cy.wait(1000);
      cy.get(`a[href="${baseUrl}/admin/index.php?route=extension/extension/module/install&user_token=${token}&extension=ukaddresssearch"]`).click();
      cy.wait(1000);
      cy.get(`a[href="${baseUrl}/admin/index.php?route=extension/module/ukaddresssearch&user_token=${token}"]`).click();
      // fill configuration data
      cy.get(`select[name="idealpostcodes_enabled"]`).select("1");
      cy.get(`input[name="idealpostcodes_api_key"]`)
          .clear({ force: true })
          .type(apiKey, { force: true });

      cy.get(`button[data-original-title="Save"]`).click({force: true});
      cy.wait(1000);
      cy.get('div.alert.alert-success').contains("Success: You have modified IdealPostcodes UK Address Search module!");
    });
  });
});
