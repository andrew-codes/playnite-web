describe('Browse', () => {
  describe('Update completion status.', () => {
    beforeEach(() => {
      cy.intercept('POST', '/api').as('api')
      cy.visit('/browse')
      cy.wait('@api')
    })

    it(`Requires being signed in.`, () => {
      cy.get('[data-test="GameFigure"]')
        .eq(0)
        .as('gameFigure')
        .find('[data-test="GameFigureChipList"] button')
        .should('not.exist')
      cy.get('@gameFigure').find('li:contains("Paused")').click({ force: true })
      cy.get('[data-test="GameFigure"]').compareSnapshot(
        'update-completion-status-requires-being-signed-in',
      )
    })
  })
})
