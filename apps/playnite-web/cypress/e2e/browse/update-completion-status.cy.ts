describe('Browse', () => {
  beforeEach(() => {})
  describe('Update completion status.', () => {
    beforeEach(() => {
      cy.intercept('POST', '/api').as('api')
    })

    beforeEach(() => {
      cy.task('updateDatabase', {
        collection: 'release',
        filter: {
          name: '3DMark',
        },
        update: {
          $set: { completionStatusId: '9c5f2de1-6be5-4751-8dbe-a64ff2bafaa7' },
        },
      })
    })

    it(`Requires being signed in.`, () => {
      cy.visit('/browse')
      cy.wait('@api')
      cy.get('[data-test="GameFigure"]')
        .find('[data-test="GameFigureChipList"] button')
        .should('not.exist')
      cy.get('[data-test="GameFigure"]')
        .contains('3DMark')
        .parents('[data-test="GameFigure"]')
        .contains('[data-test="GameFigureChipList"]', 'Completed')
        .eq(0)
        .click({ force: true })
    })

    it(`Update completion status.`, () => {
      cy.signIn()

      cy.visit('/browse')
      cy.wait('@api')
      cy.get('[data-test="GameFigure"]')
        .contains('3DMark')
        .parents('[data-test="GameFigure"]')
        .as('gameFigure')
      cy.get('@gameFigure')
        .contains('[data-test="GameFigureChipList"] button', 'Completed')
        .click()
      cy.get('@gameFigure').contains('li', 'Beaten').eq(0).click()
      cy.wait('@api')
      cy.get('@gameFigure').contains(
        '[data-test="GameFigureChipList"]',
        'Beaten',
      )
    })
  })
})
