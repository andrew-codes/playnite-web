import breakpoints from '../fixtures/devices.json'

describe('Authentication', () => {
  beforeEach(() => {
    cy.clearAllCookies()
  })
  afterEach(() => {
    cy.clearAllCookies()
  })

  beforeEach(() => {
    cy.intercept('POST', '/api').as('api')
  })

  it(`Authentication flow
- User can authenticate with a username and password.
- Authenticated user is redirected back to original page.
- Authenticated users can sign out.`, () => {
    cy.visit('/browse')
    cy.wait('@api')
    cy.get('[data-test="MainNavigation"]')
      .contains('span', 'Login')
      .parents('.MuiButtonBase-root')
      .find('.MuiTouchRipple-root')
      .click({ force: true })

    cy.get('input[name="username"]').type('local')
    cy.get('input[name="password"]').type('dev')
    cy.contains('button', 'Sign In').click()

    cy.contains('h2', 'Library')

    cy.get('[data-test="MainNavigation"]')
      .contains('span', 'Logout')
      .parents('.MuiButtonBase-root')
      .find('.MuiTouchRipple-root')
      .click({ force: true })
    cy.wait('@api')

    cy.get('[data-test="MainNavigation"]').contains('span', 'Login')
  })

  Cypress._.each(breakpoints, ([breakpointName, x, y]) => {
    describe(`Screen size: ${breakpointName}.`, () => {
      beforeEach(() => {
        cy.viewport(x, y)
      })

      it(`Authentication page`, () => {
        cy.visit('/')
        cy.get('[data-test="MainNavigation"]')
          .contains('span', 'Login')
          .parents('.MuiButtonBase-root')
          .find('.MuiTouchRipple-root')
          .click({ force: true })
        cy.wait(400)
        cy.compareSnapshot({ name: `login_${breakpointName}` })
      })
    })
  })
})
