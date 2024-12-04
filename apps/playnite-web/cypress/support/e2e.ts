import '@cypress/code-coverage/support'
import compareSnapshotCommand from 'cypress-image-diff-js/command'
import 'cypress-plugin-tab'

// declare global {
//   // eslint-disable-next-line @typescript-eslint/no-namespace
//   namespace Cypress {
//     interface Chainable {
//       signIn: () => void
//     }
//   }
// }

compareSnapshotCommand()

Cypress.Commands.add('signIn', () => {
  cy.request({
    method: 'POST',
    url: 'http://localhost:3000/api',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      operationName: 'signIn',
      variables: {
        input: { username: 'local', password: 'dev', rememberMe: false },
      },
      query:
        'mutation signIn($input: SignInInput) { signIn(input: $input) { credential }}',
    }),
  }).then((response) => {
    cy.setCookie(
      'authorization',
      `Bearer ${response.body.data.signIn.credential}`,
    )
  })
})
