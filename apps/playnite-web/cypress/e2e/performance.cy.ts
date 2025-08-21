import setups from '../support/lighthouse'

describe('Performance.', () => {
  beforeEach(() => {
    cy.task('seedUsers')
  })

  beforeEach(() => {
    cy.CDP('Network.setCacheDisabled', { cacheDisabled: false })
  })

  Cypress._.each(setups, ([opts, thresholds]) => {
    describe(opts.name, () => {
      it(`User library.`, () => {
        cy.fixture('librarySync.json').then((libraryData) => {
          cy.syncLibrary('test', 'test', libraryData).then((library) => {
            cy.visit(`/u/test/${library.body.data.syncLibrary.id}`)
            cy.wait(400)
            cy.lighthouse(thresholds, opts)
          })
        })
      })
    })
  })
})
