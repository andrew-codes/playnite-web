import breakpoints from '../../../fixtures/devices.json'

Cypress._.each(breakpoints, ([breakpointName, x, y]) => {
  describe('Remote control.', () => {
    describe('From landing page.', () => {
      describe('Game details', () => {
        describe('Remote controls.', () => {
          describe(`Screen size: ${breakpointName}.`, () => {
            beforeEach(() => {
              cy.viewport(x, y)
            })

            beforeEach(() => {
              cy.intercept('POST', '/api').as('api')
              cy.intercept('GET', /(asset-by-id)|(platforms)\/.*/).as('images')
            })

            it(`Play visible.
- Require user to be logged in.`, () => {
              cy.signIn()
              cy.visit('/')
              cy.get('[data-test="GameFigure"] button span')
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

            it.only(`Restart/stop visible.
- Require user to be logged in.`, () => {
              cy.signIn()
              cy.visit('/')
              cy.get('[data-test="GameFigure"] button span')
                .first()
                .click({ force: true })
              cy.task('mqttPublish', {
                topic: 'playnite/deviceId/response/game/state',
                payload: JSON.stringify({
                  state: 'running',
                  release: { id: 'd7fc1ab8-a697-4cd1-a249-1b4bba129278' },
                }),
              })

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
