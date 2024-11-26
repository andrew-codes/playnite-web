import breakpoints from '../../fixtures/devices.json'

const locations = [
  ['On Deck', '/'],
  ['Browse', '/browse'],
]
describe('Remote control.', () => {
  beforeEach(() => {
    cy.intercept('POST', '/api').as('api')
  })

  beforeEach(() => {
    cy.task('mqttPublish', {
      topic: 'playnite/deviceId/response/game/state',
      payload: JSON.stringify({
        state: 'installed',
        release: { id: 'd7fc1ab8-a697-4cd1-a249-1b4bba129278' },
      }),
    })
  })

  Cypress._.each(locations, ([locationName, locationPath]) => {
    describe(`${locationName}`, () => {
      describe('Game details', () => {
        describe('Remote controls.', () => {
          Cypress._.each(breakpoints, ([breakpointName, x, y]) => {
            describe(`Screen size: ${breakpointName}.`, () => {
              beforeEach(() => {
                cy.viewport(x, y)
              })

              it(`Play visible.
- Require user to be logged in.`, () => {
                cy.signIn()
                cy.visit(locationPath)
                cy.get('[data-test="GameFigure"] button span', {
                  timeout: 10000,
                })
                  .first()
                  .click({ force: true })

                cy.get('[data-test="GameDetails"]')
                  .parent()
                  .compareSnapshot({
                    name: `play-button-visible_${breakpointName}`,
                    cypressScreenshotOptions: {
                      blackout: [
                        '[data-test="GameDetails"] [data-test="Name"]',
                        '[data-test="GameDetails"] [data-test="Description"] > *',
                      ],
                    },
                  })
              })

              it(`Restart/stop visible.
- Require user to be logged in.`, () => {
                cy.signIn()
                cy.visit(locationPath)
                cy.task('mqttPublish', {
                  topic: 'playnite/deviceId/response/game/state',
                  payload: JSON.stringify({
                    state: 'running',
                    release: { id: 'd7fc1ab8-a697-4cd1-a249-1b4bba129278' },
                  }),
                })

                cy.get('[data-test="GameFigure"] button span', {
                  timeout: 10000,
                })
                  .first()
                  .click({ force: true })

                cy.get('[data-test="GameDetails"]')
                  .parent()
                  .compareSnapshot({
                    name: `restart-stop-buttons-visible_${breakpointName}`,
                    cypressScreenshotOptions: {
                      blackout: [
                        '[data-test="GameDetails"] [data-test="Name"]',
                        '[data-test="GameDetails"] [data-test="Description"] > *',
                      ],
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
