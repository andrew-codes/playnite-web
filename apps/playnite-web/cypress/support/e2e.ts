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
      lighthouse: (
        thresholds?: any,
        options?: any,
        config?: any,
      ) => Chainable<any>
      clickMenuItem: (text: string) => Chainable<JQuery<HTMLElement>>
    }
  }
}

compareSnapshotCommand()

beforeEach(() => {
  cy.clearAllCookies()
})

beforeEach(() => {
  if (Cypress.env('NODE_ENV') === 'development') {
    cy.CDP('Network.setCacheDisabled', { cacheDisabled: true })
  }
  cy.CDP('Emulation.setDeviceMetricsOverride', {
    width: 1920,
    height: 1080,
    deviceScaleFactor: 2,
    mobile: false,
  })
})

beforeEach(() => {
  cy.task('clearDatabase')
})

Cypress.on('window:before:load', (win) => {
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
  cy.wait(100)
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

Cypress.Commands.add('syncLibrary', (username, password, libraryData) => {
  cy.signIn(username, password)

  return cy.request({
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
