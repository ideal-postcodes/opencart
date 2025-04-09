/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable<Subject = any> {
    // Add types for any custom commands here
    // example: login(email: string, password: string): Chainable<void>
  }
}
