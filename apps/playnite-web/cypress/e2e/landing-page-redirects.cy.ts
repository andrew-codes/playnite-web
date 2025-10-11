import { merge } from 'lodash'

describe('Landing Page Redirects', () => {
  const username = 'test'
  const password = 'test'

  describe('Single user instance with allowAnonymousAccountCreation disabled.', () => {
    beforeEach(() => {
      cy.task('setSiteSettings', {
        allowAnonymousAccountCreation: 'false',
      })
      cy.request({
        method: 'POST',
        url: 'http://localhost:3000/api',
        body: {
          query: `mutation {
            signUp(input: {
              name: "Test User",
              username: "test",
              email: "test@example.com",
              password: "test",
              passwordConfirmation: "test"
            }) {
              user {
                id
                username
              }
            }
          }`,
        },
      })
    })

    it('Redirects to user libraries page when user has multiple libraries.', () => {
      cy.fixture('librarySync.json').then((libraryData) => {
        cy.syncLibrary(username, password, libraryData)
        cy.syncLibrary(
          username,
          password,
          merge({}, libraryData, { libraryId: 'Library:2' }),
        )
      })

      cy.visit('/')
      cy.location('pathname').should('equal', '/')
      cy.contains('Libraries')
    })

    it('redirects directly to library when user has single library', () => {
      cy.fixture('librarySync.json').then((libraryData) => {
        cy.syncLibrary(username, password, libraryData).as('library')
      })

      cy.visit('/')

      cy.location('pathname').should('equal', `/`)
      cy.contains('h1', 'My Games')
    })
  })

  describe('Single user instance with allowAnonymousAccountCreation enabled.', () => {
    beforeEach(() => {
      cy.task('setSiteSettings', {
        allowAnonymousAccountCreation: 'true',
      })
      cy.request({
        method: 'POST',
        url: 'http://localhost:3000/api',
        body: {
          query: `mutation {
            signUp(input: {
              name: "Test User",
              username: "test",
              email: "test@example.com",
              password: "test",
              passwordConfirmation: "test"
            }) {
              user {
                id
                username
              }
            }
          }`,
        },
      })
    })

    it('Does not redirect and shows landing page.', () => {
      cy.fixture('librarySync.json').then((libraryData) => {
        cy.syncLibrary(username, password, libraryData)
      })

      cy.visit('/')
      cy.location('pathname').should('equal', '/')
      cy.contains('Playnite Web')
    })
  })

  describe('Multiple user instance', () => {
    beforeEach(() => {
      cy.task('seedUsers')
      cy.task('setSiteSettings', {
        allowAnonymousAccountCreation: 'false',
      })
    })

    it('does not redirect when multiple users exist', () => {
      cy.visit('/')
      cy.location('pathname').should('equal', '/')
      cy.contains('Playnite Web')
    })
  })
})
