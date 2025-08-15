import setups from '../support/lighthouse'

describe('Performance.', () => {
  beforeEach(() => {
    cy.task('seedUsers')
  })

  Cypress._.each(setups, (opts) => {
    describe(opts.formFactor, () => {
      it(`User library.`, () => {
        cy.fixture('librarySync.json').then((libraryData) => {
          cy.syncLibrary('test', 'test', libraryData).then((library) => {
            cy.visit(`/u/test/${library.body.data.syncLibrary.id}`)
            cy.lighthouse(
              {
                performance: 80,
                accessibility: 80,
                'best-practices': 80,
                seo: 80,
                pwa: 80,
              },
              opts,
            )
          })
        })
      })
    })
  })
})
