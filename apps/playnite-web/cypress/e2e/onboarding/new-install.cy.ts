describe('Onboarding - New Install', () => {
  describe('Blank database, no users.', () => {
    it(`Redirects.
- All URLs redirect to create a new account.`, () => {
      const urls = [
        '/',
        '/browse',
        '/account',
        '/username',
        '/username/browse',
        '/username/browse/gameId',
        '/login',
      ]

      urls.forEach((url) => {
        cy.intercept('GET', url, (req) => {
          req.continue((res) => {
            expect(res.statusCode).to.equal(307)
            expect(res.headers.location).to.equal('/account/new')
          })
        })
        cy.visit(url)

        cy.window().then((win) => {
          expect(win.location.pathname).to.equal('/account/new')
        })
      })
    })
  })
})
