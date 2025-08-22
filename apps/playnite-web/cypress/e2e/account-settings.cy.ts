import { breakpoints } from 'support/breakpoints'
import { defaultSettings } from '../../src/server/userSettings'

describe('Account Settings', () => {
  beforeEach(() => {
    cy.task('seedUsers')
  })
  beforeEach(() => {
    cy.intercept('POST', '/api').as('graphql')
  })

  describe('Authorization', () => {
    it(`Unauthenticated user.`, () => {
      cy.visit('/u/test/account')
      cy.location('pathname').should('equal', '/login')
    })

    it(`Authenticated users cannot access another user's account settings.`, () => {
      cy.intercept('GET', 'u/jane/account').as('janeAccount')
      cy.signIn('test', 'test')
      cy.visit('/u/jane/account', { failOnStatusCode: false })

      cy.wait('@janeAccount').then((interception) => {
        expect(interception?.response?.statusCode).to.equal(403)
      })
    })

    it(`Authenticated users can access their own account settings.`, () => {
      cy.intercept('GET', 'u/test/account').as('testAccount')
      cy.signIn('test', 'test')
      cy.visit('/u/test/account')

      cy.wait('@testAccount').then((interception) => {
        expect(interception?.response?.statusCode).to.equal(200)
      })
    })
  })

  describe('UI.', () => {
    beforeEach(() => {
      cy.signIn('test', 'test')
    })

    Cypress._.each(breakpoints, ([name, x, y]) => {
      describe(`at ${name} breakpoint.`, () => {
        it(`Account settings.`, () => {
          cy.viewport(x, y)
          cy.visit('/u/test/account')

          cy.compareSnapshot({
            name: `${name} Account Settings`,
            cypressScreenshotOptions: {
              blackout: ['[data-test="Setting"] > div'],
            },
          })
        })
      })
    })
  })

  it(`Reset/cancel saving settings.
          - Changes are not persisted.`, () => {
    cy.signIn('test', 'test')
    cy.visit('/u/test/account')

    const settings = Cypress._.merge({}, defaultSettings)
    settings.webhook.value = 'https://example.com/webhook'

    Object.values(settings).forEach((setting) => {
      cy.get(`[data-test="${setting.id}"]`).type(setting.value ?? '')
    })

    cy.contains('button', 'Cancel').click()
    cy.reload()

    Object.values(settings).forEach((setting) => {
      cy.get(`[data-test="${setting.id}"]`).should('have.value', '')
    })
  })

  it(`Change user settings.
            - Settings can be changed and are persisted.
            - Persisted settings load correctly on subsequent visits.`, () => {
    cy.signIn('test', 'test')
    cy.visit('/u/test/account')

    const settings = Cypress._.merge({}, defaultSettings)
    settings.webhook.value = 'https://example.com/webhook'

    Object.values(settings).forEach((setting) => {
      cy.get(`[data-test="${setting.id}"]`).type(setting.value ?? '')
    })

    cy.contains('button', 'Save Changes').click()
    cy.wait('@graphql')
    cy.reload()

    Object.values(settings).forEach((setting) => {
      cy.get(`[data-test="${setting.id}"] input`).should(
        'have.value',
        setting.value,
      )
    })
  })
})
