describe('Remote control.', () => {
  beforeEach(() => {
    cy.intercept('POST', '/api').as('api')
    cy.intercept('GET', /(asset-by-id)|(platforms)\/.*/).as('images')
  })

  describe('From landing page.', () => {
    describe('Game details', () => {
      describe('Remote controls.', () => {
        it(`Play visible.
- Require user to be logged in.`, () => {
          cy.signIn()
          cy.visit('/')
          cy.get('[data-test="GameFigure"] button span')
            .first()
            .click({ force: true })
          // cy.get('[data-test="GameDetails"] h4 + div').compareSnapshot(
          //   'play-button-visible',
          // )
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
          cy.get('[data-test="GameDetails"] h4 + div')
          //.compareSnapshot('restart-stop-buttons-visible')
        })
      })
    })
  })
})
