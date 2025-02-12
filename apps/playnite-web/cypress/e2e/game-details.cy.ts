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
            cy.visit(locationPath)
          })

          it(`Displays game details
- Opens right navigation drawer when a game is clicked
- Game details display the game name and description`, () => {
            cy.get('[data-test="GameFigure"] button span')
              .first()
              .click({ force: true })

            cy.compareSnapshot({
              name: `game-details-${locationName}-${breakpointName}`,
              cypressScreenshotOptions: {
                onBeforeScreenshot($el) {
                  Cypress.$('[data-test="GameFigure"]').css(
                    'color',
                    'transparent',
                  )
                  $el.find('[data-test="Name"]').css('color', 'transparent')
                  $el
                    .find('[data-test="Description"]')
                    .css('color', 'transparent')
                  $el.find('img').css('visibility', 'hidden')
                },
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
