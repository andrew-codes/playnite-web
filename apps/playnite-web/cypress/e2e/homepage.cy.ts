describe('Homepage', () => {
  it('should load homepage', () => {
    cy.visit('/')
    cy.get('[data-test=homepage]')
  })
})
