describe('Browse', () => {
  describe('Update completion status.', () => {
    beforeEach(() => {
      cy.intercept('POST', '/api').as('api')
    })

    it(`Requires being signed in.`, () => {
      cy.visit('/browse')
      cy.wait('@api')
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

    it(`Updates completion status.`, () => {
      cy.signIn()
      cy.visit('/browse')
      cy.wait('@api')
      cy.get('[data-test="GameFigure"]')
        .eq(0)
        .as('gameFigure')
        .find('[data-test="GameFigureChipList"] button')
        .click()
      cy.get('@gameFigure').parent().find('li:contains("Beaten")').click()
      cy.wait('@api')
      cy.get('@gameFigure').contains(
        '[data-test="GameFigureChipList"]',
        'Beaten',
      )
    })
  })
})
