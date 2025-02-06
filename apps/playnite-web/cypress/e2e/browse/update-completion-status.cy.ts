describe('Browse', () => {
  beforeEach(() => {})
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

    it(`Update completion status.`, () => {
      cy.signIn()
      cy.visit('/browse')
      cy.wait('@api')
      cy.get('[data-test="GameFigure"]')
        .eq(0)
        .as('gameFigure')
        .find('[data-test="GameFigureChipList"] button')
        .click()
      cy.get('@gameFigure').parent().find('li:contains("Beaten")').eq(0).click()
      cy.wait(2000)
      // cy.wait('@api')
      cy.get('@gameFigure').contains(
        '[data-test="GameFigureChipList"]',
        'Beaten',
      )
    })
  })
})
