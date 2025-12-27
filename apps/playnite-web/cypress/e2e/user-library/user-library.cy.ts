import { breakpoints } from 'support/breakpoints'

describe('User Library', () => {
  beforeEach(() => {
    cy.signIn('test', 'test')
    cy.visit(`/u/test/Library:1`)
  })

  describe('Update completion status.', () => {
    it(`Update completion status.
    - Authenticated user owns library.
    - Other user libraries may not be updated.
    - Updates show in UI without a page refresh.`, () => {
      cy.get('[data-test="GameFigure"]')
        .contains('7 Days to Die')
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
        .contains('7 Days to Die')
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
        .should('contains.text', '456')
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

  describe.only(`Navigation.`, () => {
    describe('Unauthenticated users.', () => {
      beforeEach(() => {
        cy.signOut()
        cy.visit(`/u/test/Library:1`)
        cy.wait('@api')
      })
      describe('Navigation collapsed.', () => {
        it(`Libraries centric navigation.
      - Library links are shown in the sidebar.
      - Then main navigation.`, () => {
          cy.get('[aria-label="Game Room - test"]').within(() => {
            cy.get('[role="button"]')
              .eq(0)
              .find('[aria-label]')
              .should('have.attr', 'aria-label', 'Games')
            cy.get('[role="button"]')
              .eq(1)
              .find('[aria-label]')
              .should('have.attr', 'aria-label', 'On Deck')
          })
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
        it(`Libraries centric navigation.
          - Library links are shown in the sidebar
          - Subheading is displayed.
          - Then main navigation.`, () => {
          cy.get('button[aria-label="open drawer"]').click()
          cy.wait('@api')
          cy.wait(700)
          cy.wait('@api')
          cy.get('[aria-label="Game Room - test"]').within(() => {
            cy.contains('li', 'Game Room - test')
            cy.get('[role="button"]').eq(0).contains('div', 'Games')
            cy.get('[role="button"]').eq(1).contains('div', 'On Deck')
          })
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
    })

    describe('Authenticated users.', () => {
      describe("On another user's library page.", () => {
        beforeEach(() => {
          cy.visit(`/u/jane/Library:2`)
          cy.wait('@api')
          cy.wait(500)
        })

        describe('Navigation collapsed.', () => {
          it(`Libraries centric navigation.
      - Library links are shown in the sidebar.
      - User specific navigation.
      - Then main navigation.`, () => {
            cy.get('[aria-label="Library - jane"]').within(() => {
              cy.get('[role="button"]')
                .eq(0)
                .find('[aria-label]')
                .should('have.attr', 'aria-label', 'Games')
              cy.get('[role="button"]')
                .eq(1)
                .find('[aria-label]')
                .should('have.attr', 'aria-label', 'On Deck')
            })
            cy.get('[aria-label="Libraries - jane"]').within(() => {
              cy.get('[role="button"]')
                .eq(0)
                .find('[aria-label]')
                .should('have.attr', 'aria-label', 'Libraries')
            })
            cy.get(
              '[data-test=Navigation] > [aria-label="My Libraries"]',
            ).within(() => {
              cy.get('[role="button"]')
                .eq(0)
                .find('[aria-label]')
                .should('have.attr', 'aria-label', 'My Libraries')
              cy.get('[role="button"]')
                .eq(1)
                .find('[aria-label]')
                .should('have.attr', 'aria-label', 'Account Settings')
            })
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
          it(`Libraries centric navigation.
      - Library links are shown in the sidebar
      - Subheading is displayed.
      - User specific navigation.
      - Then main navigation.`, () => {
            cy.get('button[aria-label="open drawer"]').click()
            cy.wait('@api')
            cy.wait(700)
            cy.wait('@api')
            cy.get('[aria-label="Library - jane"]').within(() => {
              cy.contains('li', 'Library - jane')
              cy.get('[role="button"]').eq(0).contains('div', 'Games')
              cy.get('[role="button"]').eq(1).contains('div', 'On Deck')
            })
            cy.get('[aria-label="Libraries - jane"]').within(() => {
              cy.contains('li', 'Libraries - jane')
              cy.get('[role="button"]').eq(0).contains('div', 'Libraries')
            })
            cy.get(
              '[data-test=Navigation] > [aria-label="My Libraries"]',
            ).within(() => {
              cy.contains('li', 'My Libraries')
              cy.get('[role="button"]').eq(0).contains('div', 'My Libraries')
              cy.get('[role="button"]')
                .eq(1)
                .contains('div', 'Account Settings')
            })
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

      describe(`On my own library page.`, () => {
        describe('Navigation collapsed.', () => {
          it(`My library centric navigation only.
      - Library links are shown in the sidebar.
      - Then main navigation.`, () => {
            cy.get('[aria-label="Library - test"]').within(() => {
              cy.get('[role="button"]')
                .eq(0)
                .find('[aria-label]')
                .should('have.attr', 'aria-label', 'Games')
              cy.get('[role="button"]')
                .eq(1)
                .find('[aria-label]')
                .should('have.attr', 'aria-label', 'On Deck')
            })
            cy.get('[aria-label="Libraries - test"]').should('not.exist')
            cy.get(
              '[data-test=Navigation] > [aria-label="My Libraries"]',
            ).within(() => {
              cy.get('[role="button"]')
                .eq(0)
                .find('[aria-label]')
                .should('have.attr', 'aria-label', 'My Libraries')
              cy.get('[role="button"]')
                .eq(1)
                .find('[aria-label]')
                .should('have.attr', 'aria-label', 'Account Settings')
            })
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
          it(`My library centric navigation only.
      - Library links are shown in the sidebar
      - Subheading is displayed.
      - Then main navigation.`, () => {
            cy.get('button[aria-label="open drawer"]').click()
            cy.wait('@api')
            cy.wait(700)
            cy.wait('@api')
            cy.get('[aria-label="Game Room - test"]').within(() => {
              cy.contains('li', 'Game Room - test')
              cy.get('[role="button"]').eq(0).contains('div', 'Games')
              cy.get('[role="button"]').eq(1).contains('div', 'On Deck')
            })
            cy.get('[aria-label="Libraries - test"]').should('not.exist')
            cy.get(
              '[data-test=Navigation] > [aria-label="My Libraries"]',
            ).within(() => {
              cy.contains('li', 'My Libraries')
              cy.get('[role="button"]').eq(0).contains('div', 'My Libraries')
              cy.get('[role="button"]')
                .eq(1)
                .contains('div', 'Account Settings')
            })
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
})

describe('User Library', () => {
  describe.skip('UI.', () => {
    Cypress._.each(breakpoints, ([name, x, y]) => {
      describe(`${name}.`, () => {
        beforeEach(() => {
          cy.viewport(x, y)
        })

        beforeEach(() => {
          cy.visit(`/u/test/Library:1`)
        })

        it(`Displays the library correctly`, () => {
          cy.get('[data-test="GameFigure"]').contains('3DMark')

          cy.compareSnapshot({
            name: `library-${name}`,
            cypressScreenshotOptions: {
              onBeforeScreenshot($el) {
                Cypress.$('body').css('overflow-y', 'hidden')
                Cypress.$('[data-test="GameCoverImage"]').css(
                  'visibility',
                  'hidden',
                )
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
