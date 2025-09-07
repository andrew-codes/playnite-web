import { defaultSettings } from '../../src/server/siteSettings'

describe('Site-wide Administration', () => {
  beforeEach(() => {
    cy.task('seedUsers')
  })

  describe('Authorization.', () => {
    beforeEach(() => {
      cy.intercept('GET', '/admin').as('adminRoute')
    })

    it(`Unauthenticated user.`, () => {
      cy.visit('/admin', { failOnStatusCode: false })
      cy.location('pathname').should('equal', '/login')
    })

    it(`User must have the site admin permission.`, () => {
      cy.signIn('jane', 'jane')
      cy.visit('/admin', { failOnStatusCode: false })
      cy.contains('You are not authorized to view this page.').should(
        'be.visible',
      )

      cy.signIn('test', 'test')
      cy.reload()
      cy.contains('You are not authorized to view this page.').should(
        'not.exist',
      )
    })
  })

  describe('Changing settings', () => {
    Cypress._.each(Object.entries(defaultSettings), ([id, setting]) => {
      it(`${setting.name}.
        - Successful update.`, () => {
        cy.signIn('test', 'test')
        cy.visit('/admin')

        cy.get(`[aria-label="${setting.name}"]`)
          .parents('[data-test=Setting]')
          .as('setting')
          .contains('h2', setting.name)

        cy.get('@setting').contains(setting.description)
        cy.get('@setting')
          .find('input[type="checkbox"]')
          .should('not.be.checked')

        cy.get('@setting').find('input[type="checkbox"]').check()
        cy.wait('@api')
        cy.get('@setting').find('input[type="checkbox"]').should('be.checked')
      })

      it(`${setting.name}.
        - Failure to save will reset the setting to its previous value.`, () => {
        cy.signIn('test', 'test')
        cy.visit('/admin')

        cy.intercept('POST', '/api', (req) => {
          if (req.body.query.includes('updateSiteSetting')) {
            req.reply({
              errors: [
                {
                  message: 'Unauthorized',
                  locations: [
                    {
                      line: 2,
                      column: 3,
                    },
                  ],
                  path: ['updateSiteSetting'],
                },
              ],
              data: null,
            })
          }
        })
        cy.get(`[aria-label="${setting.name}"]`)
          .parents('[data-test=Setting]')
          .as('setting')

        cy.get('@setting').find('input[type="checkbox"]').check()
        cy.get('@setting')
          .find('input[type="checkbox"]')
          .should('not.be.checked')
      })
    })
  })
})
