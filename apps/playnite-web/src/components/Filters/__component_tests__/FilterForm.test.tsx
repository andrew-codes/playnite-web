import breakpoints from '../../../../cypress/fixtures/devices.json'
import { TestWrapper } from '../../../../testUtils/component'
import FilterForm from '../FilterForm'

Cypress._.each(breakpoints, ([breakpointName, x, y]) => {
  beforeEach(() => {
    cy.viewport(x as number, y as number)
  })

  describe('FilterForm', () => {
    describe(`Screen size: ${breakpointName}.`, () => {
      it('Renders', () => {
        cy.mount(
          <TestWrapper>
            <FilterForm />
          </TestWrapper>,
        )
        cy.compareSnapshot(breakpointName as string)
      })
    })
  })
})
