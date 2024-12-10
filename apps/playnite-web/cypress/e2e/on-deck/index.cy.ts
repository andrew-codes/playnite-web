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
        cy.visit('/')
        cy.wait(300)

        cy.compareSnapshot({
          name: `on-deck-playlist_${breakpointName}`,
          cypressScreenshotOptions: {
            onBeforeScreenshot($el) {
              $el.find('[data-test="GameFigure"]').css('color', 'transparent')
            },
          },
        })
      })
    })
  })
})
