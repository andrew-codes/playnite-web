import breakpoints from '../../fixtures/devices.json'

describe('Browse.', () => {
  beforeEach(() => {
    cy.intercept('POST', '/api').as('api')
  })

  it('Library is browse-able.', () => {
    cy.visit('/browse')

    cy.contains('h2', 'My Games')
    cy.contains('454 games in library')
    cy.get('[data-test="GameFigure"]').should('have.length', 20)
  })

  Cypress._.each(breakpoints, ([breakpointName, x, y]) => {
    describe(`Screen size: ${breakpointName}.`, () => {
      beforeEach(() => {
        cy.viewport(x, y)
      })

      it('Library is browse-able', () => {
        cy.visit('/browse')

        cy.contains('h2', 'My Games')
        cy.contains('454 games in library')
        cy.get('[data-test="GameFigure"]').as('games')
        cy.get('@games')
          .parents('.MuiBox-root')
          .eq(0)
          .find('> div')
          .as('scrollArea')
          .compareSnapshot({
            name: `library-games_${breakpointName}`,
            retryOptions: { limit: 1 },
            cypressScreenshotOptions: {
              onBeforeScreenshot($el) {
                $el.css('color', 'transparent')
              },
            },
          })

        cy.get('@scrollArea').scrollTo('bottom')
        cy.get('@games').contains('figcaption', 'killer7')
      })
    })
  })
})
