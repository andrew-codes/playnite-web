describe('Homepage', () => {
  it('Homepage Library', () => {
    cy.visit('/')
    cy.contains('h2', 'Library')
  })

  it(`Displays the "Playing" playlist
- Playlist shows games in a single, horizontally scrolling row.
- Playing playlist shows games that have the game state: "Playing".`, () => {
    cy.viewport(1366, 1080)
    cy.visit('/')
    cy.contains('h4', 'Playing')
      .parents('[data-test="playlist"]')
      .compareSnapshot('homepage-playing-playlist')
  })
})
