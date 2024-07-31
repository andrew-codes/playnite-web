describe('Homepage', () => {
  it('Homepage Library', () => {
    cy.visit('/')
    cy.contains('h2', 'Library')
  })

  it(`Shows the On Deck playlist
- Playlist shows games in a single, horizontally scrolling row.
- Each game shows the game's cover image and name.
- Playing playlist shows games that have the game state: "On Deck".`, () => {
    cy.viewport(1366, 1080)
    cy.visit('/')
    cy.contains('h4', 'On Deck').parents('[data-test="playlist"]')
    cy.get('[data-test="GameFigure"]').should('have.length', 3)
    cy.get('[data-test="GameFigure"]').eq(0).should('have.text', "Baldur's Gate 3")
    cy.get('[data-test="GameFigure"]').eq(1).should('have.text', "Assassin's Creed Mirage")
    cy.get('[data-test="GameFigure"]').eq(2).should('have.text', "Star Ocean: The Second Story R")

    cy.get('[data-test="playlist"] ul').compareSnapshot({
      name: 'homepage-playing-playlist',
      cypressScreenshotOptions: {
        blackout: ['img'],
      },
    })

    cy.get('[data-test="GameFigure"]').eq(0).compareSnapshot({
      name: 'game-cover-art'
    })
  })

  it.only(`Displays game details
    - Opens right navigation drawer when a game is clicked
    - Game details display the game name and description`, () => {
        cy.viewport(1366, 1080)
        cy.visit('/')
        cy.contains('h4', 'On Deck').parents('[data-test="playlist"]')
        cy.get('[data-test="GameFigure"] span').eq(0).click({ force: true })
        cy.get('[data-test="GameDetails"] h4').should('have.text', 'Baldur\'s Gate 3')
        const description = `An ancient evil has returned to Baldur's Gate, intent on devouring it from the inside out. The fate of Faerun lies in your hands. Alone, you may resist. But together, you can overcome.`
        cy.get('[data-test="GameDetails"]').should('contain.text', description)
        cy.get('[name="close-drawer"]').click()
        cy.get('[data-test="GameDetails"]').should('not.exist')
      })
})
