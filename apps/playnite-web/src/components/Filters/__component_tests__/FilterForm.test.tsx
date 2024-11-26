import { TestWrapper } from '../../../../testUtils/component'
import FilterForm from '../FilterForm'

describe('FilterForm', () => {
  it('Renders', () => {
    cy.mount(
      <TestWrapper>
        <FilterForm />
      </TestWrapper>,
    )
    cy.get('[data-test="FilterForm"]').compareSnapshot({
      name: 'FilterForm-renders',
    })
  })
})
