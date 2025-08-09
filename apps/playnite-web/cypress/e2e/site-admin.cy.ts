import { defaultSettings } from '../../src/server/siteSettings'

describe('Site-wide Administration', () => {
  beforeEach(() => {
    cy.task('seedUsers')
  })

  beforeEach(() => {
    cy.intercept('POST', '/api').as('graphql')
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

      cy.wait('@adminRoute').then((interception) => {
        expect(interception?.response?.statusCode).to.equal(403)
      })

      cy.signIn('test', 'test')
      cy.visit('/admin')
      cy.wait('@adminRoute').then((interception) => {
        expect(interception?.response?.statusCode).to.equal(200)
      })
      cy.location('pathname').should('equal', '/admin')
    })
  })

  describe('Changing settings', () => {
    Cypress._.each(Object.entries(defaultSettings), ([id, setting]) => {
      it(`${setting.name}.
        - Failure to save will reset the setting to its previous value.`, () => {
        cy.signIn('test', 'test')
        cy.visit('/admin')
        cy.wait('@graphql')

        cy.get(`[aria-label="${setting.name}"]`)
          .parents('[data-test=Setting]')
          .as('setting')
          .contains('h2', setting.name)

        cy.get('@setting').contains(setting.description)
        cy.get('@setting')
          .find('input[type="checkbox"]')
          .should('not.be.checked')

        cy.get('@setting').find('input[type="checkbox"]').check()
        cy.wait('@graphql')
        cy.get('@setting').find('input[type="checkbox"]').should('be.checked')

        cy.get('@setting').find('input[type="checkbox"]').check()
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
        cy.wait('@graphql')
        cy.get('@setting').find('input[type="checkbox"]').should('be.checked')
      })
    })
  })
})
