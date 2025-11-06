describe('Onboarding - New Install', () => {
  beforeEach(() => {
    cy.task('clearDatabase')
  })

  describe('Blank database, no users.', () => {
    it(`Redirects.
- All URLs redirect to create a new account.`, () => {
      const urls = [
        '/',
        '/u/username/account',
        '/u/username',
        '/u/username/libraryId',
        '/login',
      ]

      urls.forEach((url) => {
        cy.visit(url)

        cy.location('pathname').should('equal', '/account/new')
      })
    })
  })

  it(`Account creation works.`, () => {
    cy.visit('/account/new')

    cy.get('form[data-name="registration"]').as('registrationForm')
    cy.get('@registrationForm')
      .find('input[name="email"]')
      .type('test@example.com')
    cy.get('@registrationForm').find('input[name="username"]').type('test')
    cy.get('@registrationForm').find('input[name="name"]').type('Test User')
    cy.get('@registrationForm').find('input[name="password"]').type('test')
    cy.get('@registrationForm')
      .find('input[name="passwordConfirmation"]')
      .type('test')
    cy.get('@registrationForm').find('button[type="submit"]').click()

    cy.wait('@api')
    cy.location('pathname').should('equal', '/u/test/account')
  })

  describe('After first account created', () => {
    it(`Navigation is shown.`, () => {
      cy.task('seedUsers')
      cy.visit('/account/new', { failOnStatusCode: false })

      cy.get('[data-test=Navigation] > *').should('exist')
    })
  })
})
