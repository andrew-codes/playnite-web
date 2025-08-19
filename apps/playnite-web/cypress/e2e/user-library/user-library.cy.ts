import { breakpoints } from 'support/breakpoints'

describe('User Library', () => {
  beforeEach(() => {
    cy.intercept('POST', '/api').as('graphql')
  })

  beforeEach(() => {
    cy.task('seedUsers')
    cy.fixture('librarySync.json').then((libraryData) => {
      cy.syncLibrary('test', 'test', libraryData)
        .as('library')
        .then((library) => {
          cy.visit(`/u/test/${library.body.data.syncLibrary.id}`)
        })
    })
  })

  describe('Game grid', () => {
    it(`Displays the total count of games in the library.`, () => {
      cy.wait('@graphql')

      cy.contains('h1', 'My Games')
        .parent()
        .find(':not(h1)')
        .should('contains.text', '463')
    })

    it(`Games are displayed in a grid.
      - Each game has square cover art.
      - Game titles are displayed below the cover art.
      - Completion status is shown on the cover art.
      - Platform icons are shown on the cover art.
      `, () => {
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
            cy.contains('Played').should('be.visible')
            cy.get('img').should('have.length.greaterThan', 0)
          })
        })
    })

    it(`Games without cover art.
      - No broken images are shown.
      `, () => {
      cy.wait('@graphql')

      cy.get('[data-test="GameFigure"]').as('gameFigures')
      cy.get('@gameFigures')
        .eq(0)
        .within(() => {
          cy.get('button img').should('not.exist')
          cy.get('button > div').should('be.visible')

          cy.contains('figcaption', '3DMark').should('be.visible')
          cy.get('[data-test="GameFigureChipList"]').within(() => {
            cy.contains('Played').should('be.visible')
            cy.get('img').should('have.length.greaterThan', 0)
          })
        })
    })
  })

  describe('Navigation', () => {
    it.only(`Library centric navigation.
      - Link to view games in library.
      - Link to view playlists in library.
      - Link to go back to all user's libraries.
      - Site-wide links are shown below.
      `, () => {
      cy.wait('@graphql')

      cy.get('[data-test="Navigation"]').within(() => {
        cy.get('[aria-label="Library navigation"]').within(() => {
          cy.get('[role="button"] > div').then(($els) => {
            expect($els).to.have.length(2)
            expect($els.eq(0)).to.have.attr('aria-label', 'Games')
            expect($els.eq(1)).to.have.attr('aria-label', 'Back to Libraries')
          })
        })

        cy.get('[aria-label="Main navigation"]').within(() => {
          cy.get('[role="button"] > div').then(($els) => {
            expect($els).to.have.length(2)
            expect($els.eq(0)).to.have.attr(
              'aria-label',
              'Playnite Web Libraries',
            )
            expect($els.eq(1)).to.have.attr('aria-label', 'Sign Out')
          })
        })
      })
    })
  })

  describe('UX', () => {
    Cypress._.each(breakpoints, ([name, x, y]) => {
      describe(`at ${name} breakpoint`, () => {
        beforeEach(() => {
          cy.viewport(x, y)
        })

        it(`Displays the library correctly`, () => {
          cy.wait('@graphql')
          cy.intercept('GET', '*.webp').as('images')
          cy.wait('@images')
          cy.get('[data-test="GameFigure"]')
            .parents('.MuiBox-root')
            .eq(0)
            .find('> div')
            .as('scrollArea')
          cy.get('@scrollArea').compareSnapshot(`library-${name}`)

          cy.get('@scrollArea').scrollTo('bottom')
          cy.get('@scrollArea').compareSnapshot(`library-scroll-bottom-${name}`)
        })
      })
    })
  })
})
