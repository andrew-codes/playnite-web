describe('User Libraries', () => {
  beforeEach(() => {
    cy.intercept('POST', '/api').as('graphql')
  })
  it(`No libraries.`, () => {
    cy.task('clearDatabase')
    cy.task('seedUsers')

    cy.visit('/u/test')

    cy.get('h1').contains('Libraries')
    cy.contains('No libraries found for this user.')
    cy.contains('a', 'Sync your Library').should(
      'have.attr',
      'href',
      '/help/sync-library',
    )
  })

  it(`Libraries exist.
- Named libraries show their name.
- Unnamed libraries show default name.
- Link to library home.`, () => {
    const username = 'test'
    const password = 'test'
    cy.task('restoreDatabaseSnapshot', 'single-user-multi-library')

    cy.visit('/u/test')

    cy.get('h1').contains('Libraries')
    cy.contains('Game Room')
    cy.contains('Default Library')

    cy.get<Cypress.Response<any>>('@library1').then((response) => {
      const libraryId = response.body.data.syncLibrary.id
      cy.contains('a', 'Game Room').should(
        'have.attr',
        'href',
        `/u/${username}/${libraryId}`,
      )
    })
    cy.get<Cypress.Response<any>>('@library2').then((response) => {
      const libraryId = response.body.data.syncLibrary.id
      cy.contains('a', 'Default Library').should(
        'have.attr',
        'href',
        `/u/${username}/${libraryId}`,
      )
    })
  })

  describe('Navigation', () => {
    it(`Libraries centric navigation.
      - Library links are shown in the sidebar.
      - Help link to sync library.`, () => {
      cy.visit('/u/test')

      cy.get('[aria-label="Libraries navigation"]').within(() => {
        cy.get('[role="button"] > div').then(($els) => {
          expect($els.eq(0)).to.have.attr('aria-label', 'My Libraries')
          expect($els.eq(1)).to.have.attr('aria-label', 'Sync Library')
        })
      })
    })
  })
})
