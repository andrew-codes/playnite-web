import { breakpoints } from 'support/breakpoints'

describe('Account Settings', () => {
  beforeEach(() => {
    cy.task('seedUsers')
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
                onBeforeScreenshot($el) {
                  $el
                    .find('[data-test="Setting"] > div')
                    .each((i, $setting) => {
                      $setting.style.opacity = '0'
                    })
                },
              },
            })
          })
        })
      })
    })

    describe('Change user settings.', () => {
      beforeEach(() => {
        cy.signIn('test', 'test')
      })

      it('Webhook URL setting', () => {
        cy.visit('/u/test/account')
      })
    })
  })
})
