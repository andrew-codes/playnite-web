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
      .should('have.text', 'Black Myth: Wukong')

    cy.get('[data-test="playlist"] ul').compareSnapshot({
      name: 'homepage-playing-playlist',
      cypressScreenshotOptions: {
        blackout: ['img'],
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
    cy.get('[data-test="GameFigure"] span').eq(0).click({ force: true })
    cy.get('[data-test="GameDetails"] h4').should(
      'have.text',
      'Black Myth: Wukong',
    )
    const description = `Black Myth: Wukong is an action RPG rooted in Chinese mythology. The story is based on Journey to the West, one of the Four Great Classical Novels of Chinese literature. You shall set out as the Destined One to venture into the challenges and marvels ahead, to uncover the obscured truth beneath the veil of a glorious legend from the past.`
    cy.get('[data-test="GameDetails"]').should('contain.text', description)
    cy.get('[name="close-drawer"]').click()
    cy.get('[data-test="GameDetails"]').should('not.exist')
  })
})
