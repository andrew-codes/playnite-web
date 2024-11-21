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
    cy.get('[data-test="GameFigure"]').should('have.length', 8)
    cy.get('[data-test="GameFigure"]')
      .eq(0)
      .should('have.text', 'Star Wars Outlaws')

    cy.get('[data-test="playlist"] ul').compareSnapshot({
      name: 'homepage-playing-playlist',
      cypressScreenshotOptions: {
        blackout: ['img', 'figcaption'],
      },
    })

    cy.get('[data-test="GameFigure"]').eq(0).compareSnapshot({
      name: 'game-cover-art',
    })
  })

  it(`Displays game details
    - Opens right navigation drawer when a game is clicked
    - Game details display the game name and description`, () => {
    cy.viewport(1366, 1080)
    cy.visit('/')

    cy.contains('h4', 'On Deck').parents('[data-test="playlist"]')
    cy.get('[data-test="GameFigure"] button span').eq(0).click({ force: true })
    cy.get('[data-test="GameDetails"] h4').should(
      'have.text',
      'Star Wars Outlaws',
    )
    const description = `Experience the first-ever open world Star Wars game, set between the events of The Empire Strikes Back and Return of the Jedi. Explore distinct planets across the galaxy, both iconic and new. Risk it all as Kay Vess, an emerging scoundrel seeking freedom and the means to start a new life, along with her companion Nix. Fight, steal, and outwit your way through the galaxy’s crime syndicates as you join the galaxy’s most wanted.`
    cy.get('[data-test="GameDetails"]').should('contain.text', description)
    cy.get('[name="close-drawer"]').click()
    cy.get('[data-test="GameDetails"]').should('not.exist')
  })
})
