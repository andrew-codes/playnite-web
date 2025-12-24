import '@cypress-audit/lighthouse/commands'
import '@cypress/code-coverage/support'
import 'cypress-cdp'
import compareSnapshotCommand from 'cypress-image-diff-js/command'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      signIn: (username: string, password: string) => Chainable<Response<any>>
      signOut: () => Chainable<null>
      syncLibrary: (
        username: string,
        password: string,
        libraryData: any,
      ) => Chainable<Response<any>>
      waitForImages: (count: number) => Chainable<JQuery<HTMLImageElement>>
      syncLibraryAndQuery: (
        libraryData: any,
        queryFields: string,
      ) => Chainable<any>
      lighthouse: (
        thresholds?: any,
        options?: any,
        config?: any,
      ) => Chainable<any>
      clickMenuItem: (text: string) => Chainable<JQuery<HTMLElement>>
      restoreSnapshot: (snapshotName: string) => Chainable<boolean>
    }
  }
}

Cypress.Commands.add('restoreSnapshot', (snapshotName: string) => {
  return cy.task('restoreDatabaseSnapshot', snapshotName)
})
compareSnapshotCommand()

beforeEach(() => {
  cy.clearAllCookies()
  cy.CDP('Network.setCacheDisabled', { cacheDisabled: false })
})

beforeEach(() => {
  cy.CDP('Emulation.setDeviceMetricsOverride', {
    width: 1920,
    height: 1080,
    deviceScaleFactor: 2,
    mobile: false,
  })
})

beforeEach(() => {
  cy.intercept('POST', '/api').as('api')
  cy.intercept('_next/image*').as('image')
  cy.intercept(/.*_rsc=.*/).as('rsc')
})

beforeEach(() => {
  // Restore from snapshot instead of clearing database
  cy.task('restoreDatabaseSnapshot', 'single-user-single-library')
})

Cypress.on('window:before:load', (win) => {
  // Set __TEST__ flag to disable MUI ripple effects in e2e tests
  win.__TEST__ = true

  const doc = win.document
  // If it's not already the first child, make it so:
  const marker =
    doc.querySelector('meta[name="emotion-insertion-point"]') ??
    (() => {
      const m = doc.createElement('meta')
      m.setAttribute('name', 'emotion-insertion-point')
      m.setAttribute('content', '')
      return m
    })()
  if (doc.head.firstChild !== marker) {
    doc.head.insertBefore(marker, doc.head.firstChild)
  }
})

Cypress.Commands.overwrite('visit', (originalFn, url, options) => {
  originalFn(url, options)
  cy.get('[data-test=Navigation]', { timeout: 15000 })
  // Wait for MUI to be ready
  // cy.wait(2200)
})

Cypress.Commands.add('signIn', (username: string, password: string) => {
  return cy
    .request({
      method: 'POST',
      url: 'http://localhost:3000/api',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        operationName: 'signIn',
        variables: {
          input: { username, password, rememberMe: false },
        },
        query:
          'mutation signIn($input: SignInInput) { signIn(input: $input) { credential }}',
      }),
    })
    .then((response) => {
      cy.setCookie('authorization', response.body.data.signIn.credential, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        domain: 'localhost',
      })
    })
})

Cypress.Commands.add('signOut', () => {
  return cy.clearAllCookies()
})

Cypress.Commands.add(
  'clickMenuItem',
  { prevSubject: true },
  (subject, text) => {
    return cy
      .wrap(subject)
      .find(`[aria-label="${text}"]`)
      .parents('[role="button"]')
      .click({ force: true })
  },
)

Cypress.Commands.add('waitForImages', (count?: number) => {
  return cy.get('img', { timeout: 30000 }).should(($images) => {
    $images.slice(0, count ?? $images.length).each((_, img) => {
      expect(img.complete).to.equal(true)
    })
  })
})

Cypress.Commands.add('syncLibrary', (username, password, libraryData) => {
  cy.signIn(username, password)

  return cy
    .request({
      method: 'POST',
      url: 'http://localhost:3000/api',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        variables: {
          libraryData,
        },
        query: `mutation syncLibrary($libraryData: LibraryInput!) {
        syncLibrary(libraryData: $libraryData) {
          id
        }
      }`,
      }),
    })
    .then((response) => {
      // Extract numeric ID from format "Library:1"
      const libraryId = parseInt(
        response.body.data.syncLibrary.id.split(':')[1],
        10,
      )

      // Wait for the sync to complete by polling database
      return cy
        .task('waitForLibrarySync', {
          libraryId,
          expectedReleaseCount: libraryData.update.releases.length,
          timeout: 30000,
        })
        .then(() => {
          // Return the library ID for further queries
          return cy.wrap(response)
        })
    })
})

Cypress.Commands.add('syncLibraryAndQuery', (libraryData, queryFields) => {
  return cy
    .request({
      method: 'POST',
      url: 'http://localhost:3000/api',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        variables: {
          libraryData,
        },
        query: `mutation syncLibrary($libraryData: LibraryInput!) {
        syncLibrary(libraryData: $libraryData) {
          id
        }
      }`,
      }),
    })
    .then((response) => {
      // Extract numeric ID from format "Library:1"
      const libraryId = parseInt(
        response.body.data.syncLibrary.id.split(':')[1],
        10,
      )

      // Wait for the sync to complete
      return cy
        .task('waitForLibrarySync', {
          libraryId,
          expectedReleaseCount: libraryData.update.releases.length,
          timeout: 30000,
        })
        .then(() => {
          // Query the library with the requested fields
          return cy
            .request({
              method: 'POST',
              url: 'http://localhost:3000/api',
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
              },
              body: JSON.stringify({
                variables: {
                  libraryId: response.body.data.syncLibrary.id,
                },
                query: `query($libraryId: String!) {
                  library(libraryId: $libraryId) {
                    ${queryFields}
                  }
                }`,
              }),
            })
            .then((queryResponse) => {
              return cy.wrap(queryResponse.body.data.library)
            })
        })
    })
})
