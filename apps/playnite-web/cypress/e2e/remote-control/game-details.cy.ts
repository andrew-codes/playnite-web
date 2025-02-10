import breakpoints from '../../fixtures/devices.json'

const locations = [
  ['On Deck', '/'],
  ['Browse', '/browse'],
]
describe('Remote control.', () => {
  beforeEach(() => {
    cy.intercept('POST', '/api').as('api')
  })

  Cypress._.each(locations, ([locationName, locationPath]) => {
    describe(`${locationName}`, () => {
      describe('Signed In.', () => {
        beforeEach(() => {
          cy.signIn()
        })

        describe('Game details', () => {
          describe('Remote controls.', () => {
            Cypress._.each(breakpoints, ([breakpointName, x, y]) => {
              describe(`Screen size: ${breakpointName}.`, () => {
                beforeEach(() => {
                  cy.task('updateDatabase', {
                    collection: 'release',
                    filter: {},
                    update: { $set: { playniteWebRunState: 'stopped' } },
                  })

                  cy.viewport(x, y)
                  cy.visit(locationPath)
                  cy.wait('@api')
                })

                it(`Play visible.`, () => {
                  cy.get('[data-test="GameFigure"]', { timeout: 5000 })
                    .first()
                    .find('button img', { timeout: 5000 })
                    .parent()
                    .click({ force: true })

                  cy.get('[data-test="GameDetails"]')
                    .parent()
                    .compareSnapshot({
                      name: `${locationName}_play-button-visible_${breakpointName}`,
                      cypressScreenshotOptions: {
                        onBeforeScreenshot($el) {
                          Cypress.$('[data-test="GameFigure"]').css(
                            'color',
                            'transparent',
                          )
                          $el
                            .find('[data-test="Name"]')
                            .css('color', 'transparent')
                          $el
                            .find('[data-test="Description"]')
                            .css('color', 'transparent')
                          $el.find('img').css('visibility', 'hidden')
                        },
                      },
                    })
                })

                it.skip(`Restart/stop visible.
- Persists across page refreshes and navigation.
- Manually stopping a game does not impact visibility.`, () => {
                  cy.get('[data-test="GameFigure"]', { timeout: 5000 })
                    .first()
                    .find('button span', { timeout: 5000 })
                    .click({ force: true })

                  cy.get('[data-test="GameDetails"]').as('gameDetails')
                  cy.get('@gameDetails').contains('button', 'via').click()
                  cy.get('@gameDetails')
                    .parent()
                    .compareSnapshot({
                      name: `${locationName}_restart-stop-buttons-visible_${breakpointName}`,
                      cypressScreenshotOptions: {
                        onBeforeScreenshot($el) {
                          Cypress.$('[data-test="GameFigure"]').css(
                            'color',
                            'transparent',
                          )
                          $el
                            .find('[data-test="Name"]')
                            .css('color', 'transparent')
                          $el
                            .find('[data-test="Description"]')
                            .css('color', 'transparent')
                          $el.find('img').css('visibility', 'hidden')
                        },
                      },
                    })

                  cy.reload()
                  cy.get('[data-test="GameFigure"]', { timeout: 5000 })
                    .first()
                    .as('game')
                  cy.get('@game')
                    .find('button img', { timeout: 5000 })
                    .parent()
                    .click({ force: true })
                  cy.wait('@api', { timeout: 5000 })

                  cy.get('[data-test="GameDetails"]').as('gameDetails')
                  cy.get('@gameDetails')
                    .parent()
                    .compareSnapshot({
                      name: `${locationName}_restart-stop-buttons-visible-persist-page-refreshes_${breakpointName}`,
                      cypressScreenshotOptions: {
                        onBeforeScreenshot($el) {
                          Cypress.$('[data-test="GameFigure"]').css(
                            'color',
                            'transparent',
                          )
                          $el
                            .find('[data-test="Name"]')
                            .css('color', 'transparent')
                          $el
                            .find('[data-test="Description"]')
                            .css('color', 'transparent')
                          $el.find('img').css('visibility', 'hidden')
                        },
                      },
                    })

                  let gameId: string | undefined
                  cy.get('@game').then(($el) => {
                    gameId = $el.attr('data-test-game-id')?.split(':')[1]
                    cy.task('mqttPublish', {
                      topic: 'playnite/deviceId/response/game/state',
                      payload: JSON.stringify({
                        state: 'installed',
                        release: { id: gameId },
                      }),
                    })
                  })
                  cy.wait(3000)

                  cy.get('@gameDetails')
                    .parent()
                    .compareSnapshot({
                      name: `${locationName}_restart-stop-buttons-visible-when-manually-stopping-game_${breakpointName}`,
                      cypressScreenshotOptions: {
                        onBeforeScreenshot($el) {
                          Cypress.$('[data-test="GameFigure"]').css(
                            'color',
                            'transparent',
                          )
                          $el
                            .find('[data-test="Name"]')
                            .css('color', 'transparent')
                          $el
                            .find('[data-test="Description"]')
                            .css('color', 'transparent')
                          $el.find('img').css('visibility', 'hidden')
                        },
                      },
                    })
                })

                it(`Restart/stop stopping game.
- Once a game is stopped via Playnite Web.`, () => {
                  cy.get('[data-test="GameFigure"]', { timeout: 5000 })
                    .first()
                    .find('button img', { timeout: 5000 })
                    .parent()
                    .click({ force: true })

                  cy.get('[data-test="GameDetails"]').as('gameDetails')
                  cy.get('@gameDetails').contains('button', 'via').click()
                  cy.get('@gameDetails').contains('button', 'Stop').click()

                  cy.get('@gameDetails')
                    .parent()
                    .compareSnapshot({
                      name: `${locationName}_restart-stop-stopping-game_${breakpointName}`,
                      cypressScreenshotOptions: {
                        onBeforeScreenshot($el) {
                          Cypress.$('[data-test="GameFigure"]').css(
                            'color',
                            'transparent',
                          )
                          $el
                            .find('[data-test="Name"]')
                            .css('color', 'transparent')
                          $el
                            .find('[data-test="Description"]')
                            .css('color', 'transparent')
                          $el.find('img').css('visibility', 'hidden')
                        },
                      },
                    })
                })
              })
            })
          })
        })
      })
    })
  })
})
