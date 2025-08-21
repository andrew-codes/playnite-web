import { breakpoints } from 'support/breakpoints'
import { defaultSettings as defaultUserSettings } from '../../src/server/userSettings'

describe('Account Creation.', () => {
  beforeEach(() => {
    cy.task('seedUsers')
  })

  describe(`allowAnonymousAccountCreation setting is disabled.`, () => {
    beforeEach(() => {
      cy.task('setSiteSettings', {
        allowAnonymousAccountCreation: false,
      })
    })

    it(`Account registration is not allowed via API.`, () => {
      cy.request({
        method: 'POST',
        url: '/api',
        body: {
          query: `
            mutation {
              signUp(input: {
                name: "New User",
                username: "new-user",
                email: "new-user@example.com",
                password: "test"
                passwordConfirmation: "test"
              }) {
                user {
                  id
                }
              }
            }
          `,
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.body.errors[0].message).to.equal(
          'Anonymous account creation is not allowed.',
        )
      })

      cy.request('POST', '/api', {
        query: `
          query {
            lookupUser(username: "new-user") {
              id
            }
          }
        `,
      }).then((response) => {
        expect(response.status).to.equal(200)
        expect(response.body.data.lookupUser).to.equal(null)
      })
    })

    it(`Account registration redirects to home.`, () => {
      cy.visit('/account/new')
      cy.location('pathname').should('equal', '/')
    })
  })

  describe(`allowAnonymousAccountCreation setting is enabled.`, () => {
    beforeEach(() => {
      cy.task('setSiteSettings', {
        allowAnonymousAccountCreation: true,
      })
    })

    it(`Account registration is allowed via API.
        - User settings are initialized.`, () => {
      cy.request({
        method: 'POST',
        url: '/api',
        body: {
          query: `
            mutation {
              signUp(input: {
                name: "New User",
                username: "new-user",
                email: "new-user@example.com",
                password: "test"
                passwordConfirmation: "test"
              }) {
                user {
                  username
                }
              }
            }
          `,
        },
      }).then((response) => {
        expect(response.status).to.equal(200)
        expect(response.body.data.signUp.user.username).to.equal('new-user')
      })

      cy.request('POST', '/api', {
        query: `
          query {
            lookupUser(username: "new-user") {
              id
              username
              settings {
                id
                name
                value
                dataType
              }
            }
          }
        `,
      }).then((response) => {
        expect(response.status).to.equal(200)
        expect(response.body.data.lookupUser.username).to.equal('new-user')

        Object.values(defaultUserSettings).forEach((setting, i) => {
          expect(response.body.data.lookupUser.settings[i]).to.include({
            name: setting.name,
            value: setting.value,
            dataType: setting.dataType,
          })
        })
      })
    })

    it(`Account registration redirects to user account page.`, () => {
      cy.visit('/account/new')
      cy.location('pathname').should('equal', '/account/new')
    })

    describe(`Account requirements.`, () => {
      it(`Duplicate usernames are not allowed.`, () => {
        cy.request({
          method: 'POST',
          url: 'http://localhost:3000/api',
          failOnStatusCode: false,
          body: {
            query: `mutation signUp($input: SignUpInput!) {
                   signUp(input: $input) {
                    user {
                      id
                      username
                      isAuthenticated
                    }
                  }
                }`,
            variables: {
              input: {
                name: 'Test User',
                username: 'test',
                email: 'test2@example.com',
                password: 'test',
                passwordConfirmation: 'test',
              },
            },
          },
        }).then((response) => {
          expect(response.status).to.equal(400)
          expect(response.body.errors.length).to.equal(1)
          expect(response.body.errors?.[0].message).to.equal(
            'Username is already taken.',
          )
        })

        cy.intercept('POST', 'http://localhost:3000/api').as('signUp')
        cy.visit('/account/new')
        cy.wait(100)
        cy.get('form[data-name="registration"]').as('registrationForm')
        cy.get('@registrationForm')
          .find('input[name="email"]')
          .type('test2@example.com')
        cy.get('@registrationForm').find('input[name="username"]').type('test')
        cy.get('@registrationForm').find('input[name="name"]').type('Test User')
        cy.get('@registrationForm').find('input[name="password"]').type('test')
        cy.get('@registrationForm')
          .find('input[name="passwordConfirmation"]')
          .type('test')
        cy.get('@registrationForm').find('button[type="submit"]').click()
        cy.wait('@signUp')

        cy.get('.MuiSnackbar-root').contains('Username is already taken.')
      })

      it(`Duplicate emails are not allowed.`, () => {
        cy.request({
          method: 'POST',
          url: 'http://localhost:3000/api',
          failOnStatusCode: false,
          body: {
            query: `mutation signUp($input: SignUpInput!) {
                   signUp(input: $input) {
                    user {
                      id
                      username
                      isAuthenticated
                    }
                  }
                }`,
            variables: {
              input: {
                name: 'Test User',
                username: 'test',
                email: 'test@example.com',
                password: 'test',
                passwordConfirmation: 'test',
              },
            },
          },
        }).then((response) => {
          expect(response.status).to.equal(400)
          expect(response.body.errors.length).to.equal(1)
          expect(response.body.errors?.[0].message).to.equal(
            'Email is already in use.',
          )
        })

        cy.intercept('POST', 'http://localhost:3000/api').as('signUp')
        cy.visit('/account/new')
        cy.wait(100)
        cy.get('form[data-name="registration"]').as('registrationForm')
        cy.get('@registrationForm')
          .find('input[name="email"]')
          .type('test@example.com')
        cy.get('@registrationForm').find('input[name="username"]').type('test')
        cy.get('@registrationForm').find('input[name="name"]').type('Test User')
        cy.get('@registrationForm').find('input[name="password"]').type('test')
        cy.get('@registrationForm')
          .find('input[name="passwordConfirmation"]')
          .type('test')
        cy.get('@registrationForm').find('button[type="submit"]').click()
        cy.wait('@signUp')

        cy.get('.MuiSnackbar-root').contains('Email is already in use.')
      })

      it(`Username must use alphanumeric and "-" characters only.`, () => {
        const invalidCharacters = [
          '!',
          '@',
          '#',
          '$',
          '%',
          '^',
          '&',
          '*',
          '(',
          ')',
          '+',
          '=',
          '{',
          '}',
          '[',
          ']',
          ':',
          ';',
          '"',
          "'",
          '<',
          '>',
          ',',
          '.',
          '?',
          '/',
        ]

        invalidCharacters.forEach((char, index) => {
          cy.log(`Testing invalid characters for username: ${char}`)
          cy.request({
            method: 'POST',
            url: 'http://localhost:3000/api',
            failOnStatusCode: false,
            body: {
              query: `mutation signUp($input: SignUpInput!) {
                   signUp(input: $input) {
                    user {
                      id
                      username
                      isAuthenticated
                    }
                  }
                }`,
              variables: {
                input: {
                  name: 'Test User',
                  username: `test${char}`,
                  email: 'test@example.com',
                  password: 'test',
                  passwordConfirmation: 'test',
                },
              },
            },
          }).then((response) => {
            expect(response.status).to.equal(400)
            expect(response.body.errors.length).to.equal(1)
            expect(response.body.errors?.[0].message).to.equal(
              'Username must use alphanumeric and "-" characters only.',
            )
          })
        })

        cy.intercept('POST', 'http://localhost:3000/api').as('signUp')
        cy.visit('/account/new')
        cy.wait(100)
        cy.get('form[data-name="registration"]').as('registrationForm')
        cy.get('@registrationForm')
          .find('input[name="email"]')
          .type(`test@example.com`)
        cy.get('@registrationForm').find('input[name="username"]').type(`test@`)
        cy.get('@registrationForm').find('input[name="name"]').type('Test User')
        cy.get('@registrationForm').find('input[name="password"]').type('test')
        cy.get('@registrationForm')
          .find('input[name="passwordConfirmation"]')
          .type('test')
        cy.get('@registrationForm').find('button[type="submit"]').click()
        cy.wait('@signUp')

        cy.get('.MuiSnackbar-root').contains(
          'Username must use alphanumeric and "-" characters only.',
        )
      })
    })

    describe('UI', () => {
      Cypress._.each(breakpoints, ([name, x, y]) => {
        describe(`at ${name} breakpoint`, () => {
          it(`displays the registration form correctly`, () => {
            cy.viewport(x, y)
            cy.visit('/account/new')
            cy.compareSnapshot(`registration-form-${name}`)
          })
        })
      })
    })
  })
})
