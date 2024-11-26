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
  cy.setCookie(
    'authorization',
    'Bearer%20eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfdHlwZSI6IlVzZXIiLCJpZCI6IjEiLCJwYXNzd29yZCI6ImRldiIsInVzZXJuYW1lIjoibG9jYWwiLCJpc0F1dGhlbnRpY2F0ZWQiOnRydWUsImlhdCI6MTczMjExNTk2OSwiaXNzIjoibG9jYWxob3N0In0.ttll_8wupIPdsLsoe_ezbR8Zv7XOgCsVtiqzrS8CrjU',
  )
})
