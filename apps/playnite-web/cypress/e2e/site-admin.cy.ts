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
    it(`Allowing anonymous account registration.
      - Enabling will allow additional users to register new accounts without an invitation.`, () => {
      cy.signIn('test', 'test')
      cy.visit('/admin')
      cy.wait('@graphql')

      cy.get(
        `[aria-label="${defaultSettings.allowAnonymousAccountCreation.name}"]`,
      )
        .parents('[data-test=Setting]')
        .as('setting')
        .contains('h2', defaultSettings.allowAnonymousAccountCreation.name)

      cy.get('@setting').contains(
        defaultSettings.allowAnonymousAccountCreation.description,
      )

      cy.get('@setting').find('input[type="checkbox"]').should('not.be.checked')

      throw new Error('Not implemented')
    })
  })
})
