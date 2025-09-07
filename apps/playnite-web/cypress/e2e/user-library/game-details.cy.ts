import { breakpoints } from '../../support/breakpoints'

const locations = [['User library', '/']]
describe('Game details.', () => {
  beforeEach(() => {
    cy.intercept('POST', '/api').as('graphql')
  })

  beforeEach(() => {
    cy.task('seedUsers')
  })

  describe('UI.', () => {
    Cypress._.each(locations, ([locationName, locationPath]) => {
      describe(`${locationName}`, () => {
        Cypress._.each(breakpoints, ([breakpointName, x, y]) => {
          describe(`${breakpointName}.`, () => {
            beforeEach(() => {
              cy.viewport(x, y)
              cy.fixture('librarySync.json').then((libraryData) => {
                cy.syncLibrary('test', 'test', libraryData).then((library) => {
                  cy.visit(
                    `/u/test/${library.body.data.syncLibrary.id}${locationPath}`,
                  )
                })
              })
            })

            it(`Displays game details
            - Opens right navigation drawer when a game is clicked
            - Game details display the game name and description`, () => {
              cy.get('[data-test="GameFigure"] button img')
                .eq(0)
                .click({ force: true })
              cy.get('[data-test="GameDetails"]').should('be.visible')
              cy.get('[data-test="GameFigure"]').hideElement(true)
              cy.compareSnapshot({
                name: `${locationName}-${breakpointName}`,
                cypressScreenshotOptions: {
                  blackout: ['[data-test="Description"]'],
                },
              })

              cy.get('[name="close-drawer"]').click()
              cy.get('[data-test="GameDetails"]').should('not.exist')
            })
          })
        })
      })
    })
  })
})
