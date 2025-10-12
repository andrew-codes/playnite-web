import { breakpoints } from '../support/breakpoints'

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

  beforeEach(() => {
    cy.task('seedUsers')
  })

  it(`Authentication flow
- User can authenticate with a username and password.
- Authenticated user is redirected back to original page.
- Authenticated users can immediately sign out.`, () => {
    cy.visit('/help/sync-library')
    cy.get('[data-test="Navigation"]').clickMenuItem('Sign In')

    cy.get('input[name="username"]').type('test')
    cy.get('input[name="password"]').type('test')
    cy.contains('button', 'Sign In').click()

    cy.location('pathname').should('equal', '/help/sync-library')
    cy.wait('@api')

    cy.get('[data-test="Navigation"]', { timeout: 15000 }).clickMenuItem(
      'Sign Out',
    )
    cy.wait('@api')

    cy.get('[data-test="Navigation"]').find('[aria-label="Sign In"]')
  })

  describe('UI.', () => {
    Cypress._.each(breakpoints, ([breakpointName, x, y]) => {
      describe(`Screen size: ${breakpointName}.`, () => {
        beforeEach(() => {
          cy.viewport(x, y)
        })

        it(`Authentication page`, () => {
          cy.visit('/login')
          cy.compareSnapshot({ name: `login_${breakpointName}` })
        })
      })
    })
  })
})
