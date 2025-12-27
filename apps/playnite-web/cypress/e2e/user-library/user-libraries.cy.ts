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
    cy.task('restoreDatabaseSnapshot', 'single-user-multi-library')

    cy.visit('/u/test')

    cy.get('h1').contains('Libraries')
    cy.contains('Game Room')
    cy.contains('Default Library')

    cy.contains('a', 'Game Room').should(
      'have.attr',
      'href',
      `/u/${username}/Library:1`,
    )
    cy.contains('a', 'Default Library').should(
      'have.attr',
      'href',
      `/u/${username}/Library:2`,
    )
  })

  describe('Navigation', () => {
    describe('Navigation collapsed.', () => {
      it(`Libraries centric navigation.
      - Library links are shown in the sidebar.
      - Then main navigation.`, () => {
        cy.visit('/u/test')

        cy.get('[aria-label="Libraries - test"]').within(() => {
          cy.get('[role="button"]')
            .eq(0)
            .find('[aria-label]')
            .should('have.attr', 'aria-label', 'Libraries')
        })
        cy.get('[aria-label="Main navigation"]').within(() => {
          cy.get('[role="button"]')
            .eq(0)
            .find('[aria-label]')
            .should('have.attr', 'aria-label', 'Playnite Web Libraries')
          cy.get('[role="button"]')
            .eq(1)
            .find('[aria-label]')
            .should('have.attr', 'aria-label', 'Sign In')
        })
      })
    })

    describe('Navigation expanded.', () => {
      beforeEach(() => {
        cy.visit('/u/test')
        cy.get('button[aria-label="open drawer"]').click()
      })

      it(`Libraries centric navigation.
      - Library links are shown in the sidebar
      - Subheading is displayed.
      - Then main navigation.`, () => {
        cy.get('[aria-label="Libraries - test"]').within(() => {
          cy.contains('li', 'Libraries - test')
          cy.get('[role="button"]').eq(0).contains('div', 'Libraries')
        })
        cy.get('[aria-label="Main navigation"]').within(() => {
          cy.contains('li', 'Main navigation')
          cy.get('[role="button"]')
            .eq(0)
            .contains('div', 'Playnite Web Libraries')
          cy.get('[role="button"]').eq(1).contains('div', 'Sign In')
        })
      })
    })

    describe('Authenticated users.', () => {
      beforeEach(() => {
        cy.signIn('test', 'test')
        cy.visit('/u/test')
        cy.wait('@api')
      })

      describe('Navigation collapsed.', () => {
        it(`Libraries centric navigation.
      - Library links are shown in the sidebar.
      - User specific navigation.
      - Then main navigation.`, () => {
          cy.get('[aria-label="Libraries - test"]').within(() => {
            cy.get('[role="button"]')
              .eq(0)
              .find('[aria-label]')
              .should('have.attr', 'aria-label', 'Libraries')
          })
          cy.get('[data-test=Navigation] > [aria-label="My Libraries"]').within(
            () => {
              cy.get('[role="button"]')
                .eq(0)
                .find('[aria-label]')
                .should('have.attr', 'aria-label', 'My Libraries')
              cy.get('[role="button"]')
                .eq(1)
                .find('[aria-label]')
                .should('have.attr', 'aria-label', 'Account Settings')
            },
          )
          cy.get('[aria-label="Main navigation"]').within(() => {
            cy.get('[role="button"]')
              .eq(0)
              .find('[aria-label]')
              .should('have.attr', 'aria-label', 'Playnite Web Libraries')
            cy.get('[role="button"]')
              .eq(1)
              .find('[aria-label]')
              .should('have.attr', 'aria-label', 'Sign Out')
          })
        })
      })

      describe('Navigation expanded.', () => {
        beforeEach(() => {
          cy.get('button[aria-label="open drawer"]').click()
        })

        it(`Libraries centric navigation.
      - Library links are shown in the sidebar
      - Subheading is displayed.
      - User specific navigation.
      - Then main navigation.`, () => {
          cy.get('[aria-label="Libraries - test"]').within(() => {
            cy.contains('li', 'Libraries - test')
            cy.get('[role="button"]').eq(0).contains('div', 'Libraries')
          })
          cy.get('[data-test=Navigation] > [aria-label="My Libraries"]').within(
            () => {
              cy.contains('li', 'My Libraries')
              cy.get('[role="button"]').eq(0).contains('div', 'My Libraries')
              cy.get('[role="button"]')
                .eq(1)
                .contains('div', 'Account Settings')
            },
          )
          cy.get('[aria-label="Main navigation"]').within(() => {
            cy.contains('li', 'Main navigation')
            cy.get('[role="button"]')
              .eq(0)
              .contains('div', 'Playnite Web Libraries')
            cy.get('[role="button"]').eq(1).contains('div', 'Sign Out')
          })
        })
      })
    })
  })
})
