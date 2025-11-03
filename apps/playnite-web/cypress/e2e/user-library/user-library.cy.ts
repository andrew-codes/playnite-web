import { breakpoints } from 'support/breakpoints'

describe('User Library', () => {
  beforeEach(() => {
    cy.task('seedUsers')
    cy.fixture('librarySync.json').then((libraryData) => {
      cy.syncLibrary('test', 'test', libraryData).then((library) => {
        cy.visit(`/u/test/${library.body.data.syncLibrary.id}`)
      })
    })
  })

  describe('Update completion status.', () => {
    it(`Update completion status.
    - Authenticated user owns library.
    - Other user libraries may not be updated.
    - Updates show in UI without a page refresh.`, () => {
      cy.get('[data-test="GameFigure"]')
        .contains('3DMark')
        .parents('[data-test="GameFigure"]')
        .as('gameFigure')
      cy.get('@gameFigure')
        .contains('[data-test="GameFigureChipList"] button', 'Played')
        .click()
      cy.intercept('POST', '/api').as('updateCompletionStatus')
      cy.get('.MuiPopper-root')
        .contains('li', 'Beaten')
        .eq(0)
        .click({ force: true })
      cy.wait('@updateCompletionStatus')

      cy.get('@gameFigure').contains(
        '[data-test="GameFigureChipList"]',
        'Beaten',
      )

      cy.signOut()
      cy.reload()
      cy.get('[data-test="GameFigure"]')
        .find('[data-test="GameFigureChipList"] button')
        .should('not.exist')
      cy.get('[data-test="GameFigure"]')
        .contains('3DMark')
        .parents('[data-test="GameFigure"]')
        .contains('[data-test="GameFigureChipList"]', 'Beaten')
        .eq(0)
        .click({ force: true })
      cy.get('.MuiPopper-root').should('not.exist')

      cy.request({
        method: 'POST',
        url: '/api',
        failOnStatusCode: false,
        body: {
          query: `
             mutation updateRelease($release: ReleaseInput!) {
              updateRelease(release: $release) {
                id
              }
            }
          `,
          variables: {
            release: {
              id: '3DMark',
              completionStatus: 'CompletionStatus:1',
            },
          },
        },
      }).then((response) => {
        expect(response.status).to.equal(401)
      })
    })
  })

  describe('Game grid', () => {
    it(`Displays the total count of games in the library.`, () => {
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
      cy.get('[data-test="GameFigure"]')
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
  })

  describe('Navigation', () => {
    it(`Library centric navigation.
      - Link to view games in library.
      - Link to view playlists in library.
      - Link to go back to all user's libraries.
      - Site-wide links are shown below.
      `, () => {
      cy.get('[aria-label="open drawer"]').click()
      cy.get('[data-test="Navigation"]').within(() => {
        cy.get('nav')
          .eq(0)
          .within(() => {
            cy.get('[role="button"]')
              .parent()
              .eq(0)
              .should('have.text', 'Games')
          })
        cy.get('nav')
          .eq(1)
          .within(() => {
            cy.get('[role="button"]')
              .parent()
              .eq(0)
              .should('have.text', 'My Libraries')
            cy.get('[role="button"]')
              .parent()
              .eq(1)
              .should('have.text', 'Sync Library')
            cy.get('[role="button"]')
              .parent()
              .eq(2)
              .should('have.text', 'Account Settings')
          })
        cy.get('nav')
          .eq(2)
          .within(() => {
            cy.get('[role="button"]')
              .parent()
              .eq(0)
              .should('have.text', 'Playnite Web Libraries')
            cy.get('[role="button"]')
              .parent()
              .eq(1)
              .should('have.text', 'Sign Out')
          })
      })
    })
  })
})

describe('User Library', () => {
  describe.skip('UI.', () => {
    Cypress._.each(breakpoints, ([name, x, y]) => {
      describe(`${name}.`, () => {
        beforeEach(() => {
          cy.viewport(x, y)
        })

        beforeEach(() => {
          cy.task('seedUsers')
          cy.fixture('librarySync.json').then((libraryData) => {
            cy.syncLibrary('test', 'test', libraryData).then((library) => {
              cy.visit(`/u/test/${library.body.data.syncLibrary.id}`)
            })
          })
        })

        it(`Displays the library correctly`, () => {
          cy.get('[data-test="GameFigure"]').contains('3DMark')
          cy.get('[data-test="GameCoverImage"]').hideElement(true)

          cy.compareSnapshot({
            name: `library-${name}`,
            cypressScreenshotOptions: {
              onBeforeScreenshot($el) {
                Cypress.$('body').css('overflow-y', 'hidden')
                Cypress.$('[data-test="GameCoverImage"]').css('display', 'none')
                Cypress.$('[data-test="GameGrid"] > div').css(
                  'overflow-y',
                  'hidden',
                )
              },
            },
          })
        })
      })
    })
  })
})
