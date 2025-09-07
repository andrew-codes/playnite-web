import '@cypress/code-coverage/support'
import 'cypress-cdp'
import compareSnapshotCommand from 'cypress-image-diff-js/command'
import { mount } from 'cypress/react'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      mount: typeof mount
    }
  }
}
compareSnapshotCommand()

Cypress.Commands.add('mount', mount)

beforeEach(() => {
  cy.CDP('Emulation.setDeviceMetricsOverride', {
    width: 1920,
    height: 1080,
    deviceScaleFactor: 2,
    mobile: false,
  })
})
