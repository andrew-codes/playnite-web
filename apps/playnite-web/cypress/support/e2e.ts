import '@cypress/code-coverage/support'
import 'cypress-cdp'
import compareSnapshotCommand from 'cypress-image-diff-js/command'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      signIn: (username: string, password: string) => void
    }
  }
}

compareSnapshotCommand()

beforeEach(() => {
  cy.clearAllCookies()
})

beforeEach(() => {
  cy.CDP('Network.setCacheDisabled', { cacheDisabled: true })
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
