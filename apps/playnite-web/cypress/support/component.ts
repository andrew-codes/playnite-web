import '@cypress/code-coverage/support'
import compareSnapshotCommand from 'cypress-image-diff-js/command'
import 'cypress-plugin-tab'
import { mount } from 'cypress/react18'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      mount: typeof mount
    }
  }
}

Cypress.Commands.add('mount', mount)

compareSnapshotCommand()
