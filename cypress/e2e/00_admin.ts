/// <reference types="cypress" />
// Uncaught exceptions are now handled in support/e2e.ts

const activateExtension = (token:string|null) => {
  //Account
  cy.visit(`/admin/index.php?route=design/layout.form&user_token=${token}&layout_id=6`);
  cy.get("#module-content-top").within(() => {
    cy.get("button[title='Add Module']").click();
    cy.get("select").select("idealpostcodes.ukaddresssearch");
  });
  cy.scrollTo('top');
  cy.get('button[type="submit"][form="form-layout"]').click({force: true});
  //Checkout
  cy.visit(`/admin/index.php?route=design/layout.form&user_token=${token}&layout_id=7`);
  cy.get("#module-content-top").within(() => {
    cy.get("button[title='Add Module']").click();
    cy.get("select").select("idealpostcodes.ukaddresssearch");
  });
  cy.scrollTo('top');
  cy.get('button[type="submit"][form="form-layout"]').click({force: true});
}

describe("Admin", () => {
  const baseUrl = Cypress.config("baseUrl");
  const apiKey = Cypress.env("API_KEY");
  let token: string|null;

  beforeEach(() => {
    cy.visit("/admin");
    cy.get("#input-username").type("admin");
    cy.get("#input-password").type("password");
    cy.get("form").contains("Login").click({force:true});
    cy.url().should("include", "/admin/index.php?route=common/dashboard&user_token=");
  });

  // Get token from URL
  beforeEach(function() {
    // Skip if we already have a token
    if (token) return;
    
    cy.url().then(url => {
      const urlObj = new URL(url);
      token = urlObj.searchParams.get("user_token");
    });
  })

  after(() => activateExtension(token));

  it("Can navigate to config page", () => {
    cy.visit(`/admin/index.php?route=marketplace/extension&user_token=${token}`);
    cy.get("select[name=\"type\"]").select(`${baseUrl}/admin/index.php?route=extension/module&user_token=${token}`);
    cy.wait(2000);
    cy.get(`a[href="${baseUrl}/admin/index.php?route=extension/idealpostcodes/module/ukaddresssearch&user_token=${token}"]`).click();
    // fill configuration data
    cy.get(`select[name="idealpostcodes_enabled"]`).select("1");
    cy.get(`input[name="idealpostcodes_api_key"]`)
        .clear({ force: true })
        .type(apiKey, { force: true });

    //Add advanced configuration after tab click 
    cy.get('ul.nav-tabs a:contains("Advanced")').click();
    
    // Set Address Finder Configuration Override
    cy.get('textarea[name="idealpostcodes_autocomplete_override"]')
      .clear()
      .type('{{} "defaultCountry": "GBR", "detectCountry": false {}}');
    
    // Save configuration
    cy.get(`button.btn.btn-primary[title="Save"]`).click({force: true});
    
    // Verify configuration was saved
    cy.wait(1000);
    cy.get(`a[href="${baseUrl}/admin/index.php?route=extension/idealpostcodes/module/ukaddresssearch&user_token=${token}"]`).click();
    // Verify the configuration values
    cy.get('ul.nav-tabs a:contains("Advanced")').click();
    cy.get('textarea[name="idealpostcodes_autocomplete_override"]')
      .should('have.value', '{ "defaultCountry": "GBR", "detectCountry": false }');
  });
});
