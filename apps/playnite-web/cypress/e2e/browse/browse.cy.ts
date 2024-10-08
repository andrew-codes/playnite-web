describe('Browse library', () => {
  beforeEach(() => {
    cy.intercept('POST', '/api').as('api')
    cy.intercept('GET', '/asset-by-id/*').as('images')
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

  it('Games have platform icons', () => {
    cy.visit('/browse')
    cy.wait('@api')
    cy.wait('@images')

    cy.get('[data-test="GameFigure"]')
      .eq(0)
      .find('[data-test="PlatformListItem"]')
      .should('have.length', 1)
    cy.get('[data-test="GameFigure"]')
      .contains('3DMark')
      .parents('[data-test="GameFigure"]')
      .find('[data-test="PlatformListItem"]')
      .compareSnapshot({
        name: 'single-platform-icon',
      })

    cy.get('[data-test="GameFigure"]')
      .contains('Alan Wake Remastered')
      .parents('[data-test="GameFigure"]')
      .find('[data-test="PlatformList"]')
      .compareSnapshot({ name: 'two-platform-icons' })
  })
})
