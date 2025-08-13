import { breakpoints } from '../../support/breakpoints'

const locations = [['User library', '/']]
describe('Game details.', () => {
  beforeEach(() => {
    cy.intercept('POST', '/api').as('graphql')
  })

  beforeEach(() => {
    cy.task('seedUsers')
  })

  Cypress._.each(locations, ([locationName, locationPath]) => {
    describe(`${locationName}`, () => {
      Cypress._.each(breakpoints, ([breakpointName, x, y]) => {
        describe(`Screen size: ${breakpointName}.`, () => {
          beforeEach(() => {
            cy.viewport(x, y)
            cy.fixture('librarySync.json').then((libraryData) => {
              cy.syncLibrary('test', 'test', libraryData).then((library) => {
                cy.visit(
                  `/u/test/${library.body.data.syncLibrary.id}${locationPath}`,
                )
              })
              cy.wait('@graphql')
            })
          })

          it(`Displays game details
- Opens right navigation drawer when a game is clicked
- Game details display the game name and description`, () => {
            cy.get('[data-test="GameFigure"] button')
              .eq(1)
              .click({ force: true })
            cy.wait('@graphql')

            cy.compareSnapshot({
              name: `${locationName}-${breakpointName}`,
              cypressScreenshotOptions: {
                onBeforeScreenshot($el) {
                  Cypress.$('[data-test="GameFigure"]').css(
                    'color',
                    'transparent',
                  )
                },
              },
            })

            cy.get('[name="close-drawer"]').click()
            cy.get('[data-test="GameDetails"]').should('not.exist')
          })
        })
      })
    })
  })

  it(`Update completion status.
    - Authenticated user owns library.
    - Other user libraries may not be updated.
    - Updates show in UI without a page refresh.`, () => {
    cy.fixture('librarySync.json').then((libraryData) => {
      cy.syncLibrary('test', 'test', libraryData).then((library) => {
        cy.visit(`/u/test/${library.body.data.syncLibrary.id}`)
      })
      cy.wait('@graphql')
      cy.get('[data-test="GameFigure"]')
        .contains('3DMark')
        .parents('[data-test="GameFigure"]')
        .as('gameFigure')
      cy.get('@gameFigure')
        .contains('[data-test="GameFigureChipList"] button', 'Played')
        .click()
      cy.get('.MuiPopper-root')
        .contains('li', 'Beaten')
        .eq(0)
        .click({ force: true })
      cy.wait('@graphql')
      cy.wait('@graphql')

      cy.get('@gameFigure').contains(
        '[data-test="GameFigureChipList"]',
        'Beaten',
      )

      cy.signOut()
      cy.reload()
      cy.wait(5000)
      cy.wait('@graphql')
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
    })
  })

  it(`Update completion status: after scrolling.`, () => {
    cy.fixture('librarySync.json').then((libraryData) => {
      cy.syncLibrary('test', 'test', libraryData).then((library) => {
        cy.visit(`/u/test/${library.body.data.syncLibrary.id}`)
      })
      cy.wait('@graphql')
      cy.get('[data-test="GameFigure"]').as('games')
      cy.get('@games')
        .parents('.MuiBox-root')
        .eq(0)
        .find('> div')
        .scrollTo('bottom')
      cy.get('[data-test="GameFigure"]')
        .contains('Yakuza: Like A Dragon')
        .parents('[data-test="GameFigure"]')
        .as('gameFigure')
      cy.get('@gameFigure')
        .contains('[data-test="GameFigureChipList"] button', 'Not Played')
        .click()
      cy.get('.MuiPopper-root')
        .contains('li', 'Beaten')
        .eq(0)
        .click({ force: true })
      cy.wait('@graphql')
      cy.wait('@graphql')

      cy.get('@gameFigure').contains(
        '[data-test="GameFigureChipList"]',
        'Beaten',
      )
    })
  })
})
