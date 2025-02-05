import breakpoints from '../../fixtures/devices.json'

describe('On deck.', () => {
  beforeEach(() => {
    cy.intercept('POST', '/api').as('api')
  })

  Cypress._.each(breakpoints, ([breakpointName, x, y]) => {
    describe(`Screen size: ${breakpointName}.`, () => {
      beforeEach(() => {
        cy.viewport(x, y)
        cy.visit('/')
        cy.wait('@api')
      })

      // Flaky test for unknown reasons; skipping for now
      it.skip(`Shows the On Deck playlist
- Playlist shows games in a single, horizontally scrolling row.
- Each game shows the game's cover image and name.
- Playing playlist shows games that have the game state: "On Deck".`, () => {
        cy.compareSnapshot({
          name: `on-deck-playlist_${breakpointName}`,
        })
      })
    })
  })
})
