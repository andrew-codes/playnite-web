describe('Account Settings', () => {
  beforeEach(() => {
    cy.task('seedUsers')
  })

  describe('Authorization', () => {
    it(`Unauthenticated user.`, () => {
      cy.visit('/u/test/account')
      cy.location('pathname').should('equal', '/login')
    })

    it(`Authenticated users cannot access another user's account settings.`, () => {
      cy.intercept('GET', 'u/jane/account').as('janeAccount')
      cy.signIn('test', 'test')
      cy.visit('/u/jane/account', { failOnStatusCode: false })

      cy.wait('@janeAccount').then((interception) => {
        expect(interception?.response?.statusCode).to.equal(403)
      })
    })

    it(`Authenticated users can access their own account settings.`, () => {
      cy.intercept('GET', 'u/test/account').as('testAccount')
      cy.signIn('test', 'test')
      cy.visit('/u/test/account')

      cy.wait('@testAccount').then((interception) => {
        expect(interception?.response?.statusCode).to.equal(200)
      })
    })
  })
})
