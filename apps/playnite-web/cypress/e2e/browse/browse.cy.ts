describe('Browse library', () => {
  beforeEach(() => {
    cy.intercept('POST', '/api').as('api')
    cy.intercept('GET', /(asset-by-id)|(platforms)\/.*/).as('images')
  })
  it('Library is browse-able', () => {
    cy.visit('/')
    cy.get('[data-test="MainNavigation"]')
      .contains('span', 'My Games')
      .parents('.MuiButtonBase-root')
      .find('.MuiTouchRipple-root')
      .click({ force: true })
    cy.wait('@api')
    cy.wait('@images')

    cy.contains('h2', 'My Games')
    cy.contains('439 games in library')
    cy.get('[data-test="GameFigure"]').as('games').should('have.length', 20)
    cy.get('@games')
      .find('img')
      .then((els) => els.css({ visibility: 'hidden', opacity: 0 }))
    cy.get('@games')
      .find('img')
      .parent()
      .then((els) => els.css({ border: '1px solid red' }))
    cy.get('@games')
      .parents('.MuiBox-root')
      .eq(0)
      .as('scrollArea')
      .compareSnapshot({
        name: 'library-games',
        retryOptions: { limit: 1 },
      })

    cy.get('@scrollArea').find('> div').scrollTo('bottom')
    cy.get('@games').contains('figcaption', 'Yakuza: Like a Dragon')
  })
})
