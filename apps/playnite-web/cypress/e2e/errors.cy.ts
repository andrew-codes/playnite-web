describe('Errors', () => {
  beforeEach(() => {
    cy.task('seedUsers')
  })

  it('403 Unauthorized', () => {
    cy.signIn('test', 'test')
    cy.visit('/u/jane/account', { failOnStatusCode: false })

    cy.contains('Forbidden').should('be.visible')
  })

  it('404 Not found', () => {
    cy.visit('/not-found', { failOnStatusCode: false })

    cy.contains('Not Found').should('be.visible')
  })
})
