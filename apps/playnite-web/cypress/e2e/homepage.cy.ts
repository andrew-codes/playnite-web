describe('Homepage', () => {
  it('Homepage Library', () => {
    cy.visit('/')
    cy.contains('h2', 'Library')
  })
})
