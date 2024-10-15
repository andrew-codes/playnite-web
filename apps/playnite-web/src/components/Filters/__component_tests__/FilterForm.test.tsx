import { TestWrapper, useBreakpoint } from '../../../../testUtils/component'
import FilterForm from '../FilterForm'

describe('FilterForm', () => {
  describe('xxl', () => {
    beforeEach(() => {
      useBreakpoint('xxl')
    })
    it('Renders', () => {
      cy.mount(
        <TestWrapper>
          <FilterForm />
        </TestWrapper>,
      )
      cy.compareSnapshot('xxl')
    })
  })

  describe('xl', () => {
    beforeEach(() => {
      useBreakpoint('xl')
    })
    it('Renders', () => {
      cy.mount(
        <TestWrapper>
          <FilterForm />
        </TestWrapper>,
      )
      cy.compareSnapshot('xl')
    })
  })

  describe('lg', () => {
    beforeEach(() => {
      useBreakpoint('lg')
    })
    it('Renders', () => {
      cy.mount(
        <TestWrapper>
          <FilterForm />
        </TestWrapper>,
      )
      cy.compareSnapshot('lg')
    })
  })

  describe('md', () => {
    beforeEach(() => {
      useBreakpoint('md')
    })
    it('Renders', () => {
      cy.mount(
        <TestWrapper>
          <FilterForm />
        </TestWrapper>,
      )
      cy.compareSnapshot('md')
    })
  })

  describe('sm', () => {
    beforeEach(() => {
      useBreakpoint('sm')
    })
    it('Renders', () => {
      cy.mount(
        <TestWrapper>
          <FilterForm />
        </TestWrapper>,
      )
      cy.compareSnapshot('sm')
    })
  })

  describe('xs', () => {
    beforeEach(() => {
      useBreakpoint('xs')
    })
    it('Renders', () => {
      cy.mount(
        <TestWrapper>
          <FilterForm />
        </TestWrapper>,
      )
      cy.compareSnapshot('xs')
    })
  })
})
