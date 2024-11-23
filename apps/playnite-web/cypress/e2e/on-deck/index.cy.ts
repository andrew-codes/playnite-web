import breakpoints from '../../fixtures/devices.json'

describe('On deck.', () => {
  Cypress._.each(breakpoints, ([breakpointName, x, y]) => {
    describe(`Screen size: ${breakpointName}.`, () => {
      beforeEach(() => {
        cy.viewport(x, y)
      })

      it(`Shows the On Deck playlist
- Playlist shows games in a single, horizontally scrolling row.
- Each game shows the game's cover image and name.
- Playing playlist shows games that have the game state: "On Deck".`, () => {
        cy.viewport(1366, 1080)
        cy.visit('/')

        cy.contains('h4', 'On Deck').parents('[data-test="playlist"]')
        cy.get('[data-test="GameFigure"]').should('have.length', 8)
        cy.get('[data-test="GameFigure"]')
          .eq(0)
          .should('have.text', 'Star Wars Outlaws')

        cy.compareSnapshot({
          name: 'on-deck-playlist',
          cypressScreenshotOptions: {
            blackout: ['img', '[data-test="GameFigure"] figcaption'],
          },
        })

        cy.get('[data-test="GameFigure"]').eq(0).compareSnapshot({
          name: 'game-cover-art',
        })
      })
    })
  })
})
