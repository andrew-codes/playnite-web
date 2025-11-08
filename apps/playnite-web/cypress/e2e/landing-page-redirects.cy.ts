describe('Landing Page Redirects', () => {
  describe('Single user with single library instance.', () => {
    beforeEach(() => {
      cy.task('restoreDatabaseSnapshot', 'single-user-single-library')
    })

    describe('allowAnonymousAccountCreation disabled.', () => {
      beforeEach(() => {
        cy.task('setSiteSettings', {
          allowAnonymousAccountCreation: 'false',
        })
      })

      it('Redirects to user libraries page when user has multiple libraries.', () => {
        cy.task('restoreDatabaseSnapshot', 'single-user-multi-library')

        cy.visit('/')
        cy.location('pathname').should('equal', '/')
        cy.contains('Libraries')
      })

      it('redirects directly to library when user has single library', () => {
        cy.visit('/')

        cy.location('pathname').should('equal', `/`)
        cy.contains('h1', 'My Games')
      })
    })

    describe('allowAnonymousAccountCreation enabled.', () => {
      beforeEach(() => {
        cy.task('setSiteSettings', {
          allowAnonymousAccountCreation: 'true',
        })
      })

      it('Does not redirect and shows landing page.', () => {
        cy.visit('/')
        cy.location('pathname').should('equal', '/')
        cy.contains('Playnite Web')
      })
    })
  })

  describe('Multiple user instance', () => {
    beforeEach(() => {
      cy.task('restoreDatabaseSnapshot', 'multi-user')
      cy.task('setSiteSettings', {
        allowAnonymousAccountCreation: 'false',
      })
    })

    it('Does not redirect when multiple users exist', () => {
      cy.visit('/')
      cy.location('pathname').should('equal', '/')
      cy.contains('Playnite Web')
    })
  })
})
