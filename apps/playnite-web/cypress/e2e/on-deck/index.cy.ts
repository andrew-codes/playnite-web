import breakpoints from '../../fixtures/devices.json'

describe('On deck.', () => {
  Cypress._.each(breakpoints, ([breakpointName, x, y]) => {
    describe(`Screen size: ${breakpointName}.`, () => {
      beforeEach(() => {
        cy.viewport(x, y)
      })

      it.skip(`Shows the On Deck playlist
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
              $el.find('img').each((_, el) => {
                const rect = el.getBoundingClientRect()
                const styles = window.getComputedStyle(el)

                const placeholder = document.createElement('div')
                placeholder.style.width = `${rect.width}px`
                placeholder.style.height = `${rect.height}px`
                placeholder.style.backgroundColor = styles.backgroundColor
                placeholder.style.position = styles.position
                placeholder.style.top = styles.top
                placeholder.style.left = styles.left
                placeholder.style.right = styles.right
                placeholder.style.bottom = styles.bottom
                placeholder.style.margin = styles.margin
                placeholder.style.display = styles.display
                placeholder.style.border = `1px solid red`

                el.parentNode?.insertBefore(placeholder, el)
                el.style.visibility = 'hidden'
              })
            },
          },
        })
      })
    })
  })
})
