import breakpoints from '../fixtures/devices.json'

const locations = [
  ['On Deck', '/'],
  ['Browse', '/browse'],
]
describe('Game details.', () => {
  beforeEach(() => {
    cy.intercept('POST', '/api').as('api')
  })

  Cypress._.each(locations, ([locationName, locationPath]) => {
    describe(`${locationName}`, () => {
      Cypress._.each(breakpoints, ([breakpointName, x, y]) => {
        describe(`Screen size: ${breakpointName}.`, () => {
          beforeEach(() => {
            cy.viewport(x, y)
          })

          it(`Displays game details
- Opens right navigation drawer when a game is clicked
- Game details display the game name and description`, () => {
            cy.visit(locationPath)

            cy.get('[data-test="GameFigure"] button span')
              .first()
              .click({ force: true })
            cy.wait('@api')

            cy.compareSnapshot({
              name: `game-details-${locationName}-${breakpointName}`,
              cypressScreenshotOptions: {
                blackout: [
                  '[data-test="GameDetails"] [data-test="Name"]',
                  '[data-test="GameDetails"] [data-test="Description"] > *',
                ],
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
