import { TestWrapper } from '../../../../testUtils/component'
import FilterForm from '../FilterForm'

describe('FilterForm', () => {
  it('Renders', () => {
    cy.mount(
      <TestWrapper>
        <FilterForm />
      </TestWrapper>,
    )
    cy.compareSnapshot('FilterForm-renders')
  })
})
