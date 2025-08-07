describe('User Library', () => {
  beforeEach(() => {
    cy.intercept('POST', '/api').as('graphql')
  })

  beforeEach(() => {
    cy.task('seedUsers')
    cy.fixture('librarySync.json').then((libraryData) => {
      cy.syncLibrary('test', 'test', libraryData).as('library')
    })
  })

  it(`Displays the total count of games in the library.`, () => {
    cy.get<Cypress.Response<any>>('@library').then((library) => {
      cy.visit(`/u/test/${library.body.data.syncLibrary.id}`)
      cy.wait('@graphql')

      cy.contains('h2', 'My Games')
        .parent()
        .find(':not(h2)')
        .should('contains.text', '463')
    })
  })

  it(`Games are displayed in a grid.
      - Each game has square cover art.
      - Game titles are displayed below the cover art.
      - Completion status is shown on the cover art.
      - Platform icons are shown on the cover art.
      `, () => {
    cy.get<Cypress.Response<any>>('@library').then((library) => {
      cy.visit(`/u/test/${library.body.data.syncLibrary.id}`)
    })

    cy.wait('@graphql')

    cy.get('[data-test="GameFigure"]').as('gameFigures')
    cy.get('@gameFigures')
      .eq(1)
      .within(() => {
        cy.get('img')
          .should('have.css', 'width')
          .then((width) => {
            cy.get('img').should('have.css', 'height').should('equal', width)
          })

        cy.contains('figcaption', '7 Days to Die').should('be.visible')
        cy.get('[data-test="GameFigureChipList"]').within(() => {
          cy.contains('Not Played').should('be.visible')
          cy.get('img').should('have.length.greaterThan', 0)
        })
      })
  })

  it.only(`Games without cover art.
      - No broken images are shown.
      `, () => {
    cy.get<Cypress.Response<any>>('@library').then((library) => {
      cy.visit(`/u/test/${library.body.data.syncLibrary.id}`)
    })

    cy.wait('@graphql')

    cy.get('[data-test="GameFigure"]').as('gameFigures')
    cy.get('@gameFigures')
      .eq(0)
      .within(() => {
        cy.get('button img').should('not.exist')

        cy.contains('figcaption', '3DMark').should('be.visible')
        cy.get('[data-test="GameFigureChipList"]').within(() => {
          cy.contains('Played').should('be.visible')
          cy.get('img').should('have.length.greaterThan', 0)
        })
      })
  })
})
