import setups from '../support/lighthouse'

describe.skip('Performance.', () => {
  beforeEach(() => {
    cy.intercept(/u\/test\/.*/).as('getLibrary')
  })

  beforeEach(() => {
    cy.CDP('Network.setCacheDisabled', { cacheDisabled: false })
  })

  Cypress._.each(setups, ([opts, thresholds]) => {
    describe(opts.name, () => {
      it(`User library.`, () => {
        cy.visit(`/u/test/Library:1`)
        cy.wait('@getLibrary')
        cy.lighthouse(thresholds, opts)
      })
    })
  })
})
