describe('Errors', () => {
  it('403 Unauthorized', () => {
    cy.task('restoreDatabaseSnapshot', 'multi-user')
    cy.signIn('test', 'test')
    cy.visit('/u/jane/account', { failOnStatusCode: false })

    cy.contains('You are not authorized to view this page.').should(
      'be.visible',
    )
  })

  it('404 Not found', () => {
    cy.visit('/not-found', { failOnStatusCode: false })

    cy.contains('Not Found').should('be.visible')
  })
})
