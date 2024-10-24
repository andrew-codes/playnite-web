describe('Authentication', () => {
  beforeEach(() => {
    cy.clearAllCookies()
  })

  afterEach(() => {
    cy.clearAllCookies()
  })

  it(`Authentication flow
- User can authenticate with a username and password.
- Authenticated user is redirected back to home page.
- Authenticated users see a play button in the game details.
- Authenticated users can sign out.`, () => {
    cy.visit('/browse')
    cy.get('[data-test="MainNavigation"]')
      .contains('span', 'Login')
      .parents('.MuiButtonBase-root')
      .find('.MuiTouchRipple-root')
      .click({ force: true })

    cy.get('input[name="username"]').type('local')
    cy.get('input[name="password"]').type('dev')
    cy.contains('button', 'Sign In').click()

    cy.contains('h2', 'Library')
    cy.get('[data-test="GameFigure"] span').eq(0).click({ force: true })
    cy.get('[data-test="GameDetails"]').find(
      '[role="group"][aria-label="Platforms in which to play the game"]',
    )

    cy.get('[data-test="MainNavigation"]')
      .contains('span', 'Logout')
      .parents('.MuiButtonBase-root')
      .find('.MuiTouchRipple-root')
      .click({ force: true })

    cy.get('[data-test="GameDetails"]')
      .find('[role="group"][aria-label="Platforms in which to play the game"]')
      .should('not.exist')
  })
})
