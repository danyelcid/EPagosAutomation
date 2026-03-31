// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
 Cypress.Commands.add('login', (email, password, ambiente) => { 
    switch (ambiente) {
        case 'test':
            cy.visit('https://epagostest.sva.antel.com.uy/backoffice/config/login?0')
            break;
        case 'prep':
            cy.visit('https://epagos-prep-rp03.sva.antel.com.uy/backoffice/config/login?0')
            break;
        default:
            cy.visit('https://backoffice.pagos.antel.com.uy/backoffice/config/login?0')
    }
    cy.get('#login').type(email)
    cy.get('#password').type(password)
    cy.get('[type="submit"]').click()
   })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test
  return false
})

Cypress.Commands.add('safeType', (selector, value, options) => {
  const {
    delay = 0,
    force = true
  } = options || {}

  cy.get(selector)
    .should('be.visible')
    .and('not.be.disabled')
    .click({ force })
    .then($el => {
      if ($el.val() !== '') {
        cy.wrap($el).clear({ force })
      }
    })
    .type(value, { delay, force })
    .should('have.value', value)
})

Cypress.Commands.add('setCheckbox', (selector, value) => {
  cy.get(selector)
    .should('exist')
    .should('be.visible')
    .then($checkbox => {
      const isChecked = $checkbox.is(':checked')

      if (isChecked !== value) {
        cy.wrap($checkbox)[value ? 'check' : 'uncheck']({ force: true })
      }
    })
    .should(value ? 'be.checked' : 'not.be.checked')
})