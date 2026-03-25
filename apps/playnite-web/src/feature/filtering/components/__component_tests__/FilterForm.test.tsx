import { TestWrapper } from '../../../../../testUtils/component'
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

  it('clear name filter button has an accessible name', () => {
    cy.mount(
      <TestWrapper>
        <FilterForm nameFilter="test" />
      </TestWrapper>,
    )
    cy.get('button[aria-label="Clear name filter"]').should('exist')
  })
})
