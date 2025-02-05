describe('Game details.', () => {
  beforeEach(() => {
    cy.intercept('POST', '/api').as('api')
  })

  it(`Main navigation.`, () => {
    cy.visit('/')
    cy.wait('@api')

    cy.get('[data-test="MainNavigation"]')
      .as('mainNavigation')
      .contains('span', 'My Games')
      .parents('.MuiButtonBase-root')
      .find('.MuiTouchRipple-root')
      .click({ force: true })
    cy.wait('@api')

    cy.window().then((win) => {
      expect(win.location.pathname).to.equal('/browse')
    })
  })
})
