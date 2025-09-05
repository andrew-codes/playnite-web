import { breakpoints } from '../../support/breakpoints'

// Filtering is broken; tracked in separate issue.
describe('Filtering.', () => {
  beforeEach(() => {
    cy.intercept('POST', '/api').as('api')
  })

  beforeEach(() => {
    cy.task('seedUsers')
  })

  it(`Filter button opens filter pane.
    - Is navigable by URL.`, () => {
    cy.fixture('librarySync.json').then((libraryData) => {
      cy.syncLibrary('test', 'test', libraryData).then((library) => {
        cy.visit(`/u/test/${library.body.data.syncLibrary.id}`)
      })
    })
    cy.get('[aria-label="Open filter drawer"]').trigger('mouseover')
    cy.wait(200)
    cy.get('[aria-label="Open filter drawer"]').click()
    cy.wait(200)
    cy.get('[aria-label="Open filter drawer"]')
      .find('.MuiTouchRipple-root', { timeout: 3000 })
      .click({
        force: true,
      })

    cy.contains('h4', 'Filters').should('be.visible')
    cy.location('search').should('contain', 'showFilterPane=true')
  })

  describe('Filter pane opened.', () => {
    beforeEach(() => {
      cy.fixture('librarySync.json').then((libraryData) => {
        cy.syncLibrary('test', 'test', libraryData).then((library) => {
          cy.visit(
            `/u/test/${library.body.data.syncLibrary.id}?showFilterPane=true`,
          )
        })
      })
    })

    describe('Name.', () => {
      it('Like name.', () => {
        cy.contains('label', 'Find')
          .parent()
          .get('input[name="nameFilter"]')
          .type('Alan')
        cy.contains('button', 'Filter').as('filterButton').click()
        cy.get('[data-test="GameFigure"]')
          .should('have.length', 1)
          .should('contain', 'Alan Wake Remastered')
      })

      it('Exact match name.', () => {
        cy.contains('label', 'Find')
          .parent()
          .get('input[name="nameFilter"]')
          .type('"Batman"')
        cy.contains('button', 'Filter').as('filterButton').click()
        cy.get('[data-test="GameFigure"]')
          .should('have.length', 1)
          .should('contain', 'Batman')
      })
    })

    it(`Completion status.
      - Games must match at least one completion status.`, () => {
      const filterBy = 'Completion Status'
      const filterValues = ['Played', 'Not Played']
      const scoped = 'Batman'

      if (scoped) {
        cy.contains('label', 'Find')
          .parent()
          .get('input[name="nameFilter"]')
          .type(scoped)
      }

      cy.contains('label', 'Filter By').parent().click()

      cy.get('[role="listbox"]').contains('li', filterBy).click()
      cy.contains('label', filterBy)
        .parent()
        .as('filter')
        .find('input[role="combobox"]')
        .as('lookup')
        .click()

      for (const filter of filterValues) {
        cy.contains('[role="option"]', new RegExp(`^${filter}$`)).click()
      }

      for (const filter of filterValues) {
        cy.contains('[data-tag-index]', new RegExp(`^${filter}$`))
      }

      cy.get('h2 + button').click()
      cy.contains('button', 'Filter').click()

      cy.get('[data-test="GameFigure"]').should('have.length', 7)
      cy.get('[data-test="GameFigure"]').eq(0).contains('figcaption', 'Batman')
      cy.get('[data-test="GameFigure"]')
        .eq(3)
        .contains('figcaption', 'Batman: Arkham City GOTY')
    })

    it(`Feature.
      - Games must match at least one features.`, () => {
      const filterBy = 'Feature'
      const filterValues = ['Split Screen', 'Massively Multiplayer Online']
      const scoped = null

      if (scoped) {
        cy.contains('label', 'Find')
          .parent()
          .get('input[name="nameFilter"]')
          .type(scoped)
      }

      cy.contains('label', 'Filter By').parent().click()

      cy.get('[role="listbox"]').contains('li', filterBy).click()
      cy.contains('label', filterBy)
        .parent()
        .as('filter')
        .find('input[role="combobox"]')
        .as('lookup')
        .click()

      for (const filter of filterValues) {
        cy.contains(new RegExp(`^${filter}.*$`)).click()
      }

      for (const filter of filterValues) {
        cy.get('@filter').contains(new RegExp(`^${filter}.*$`))
      }

      cy.get('h2 + button').click()
      cy.contains('button', 'Filter').click()

      cy.get('[data-test="GameFigure"]')
        .as('gameFigures')
        .eq(0)
        .contains('figcaption', '7 Days to Die')
      cy.get('[data-test="GameFigure"]')
        .as('gameFigures')
        .eq(10)
        .contains('figcaption', 'Fallout 76')
    })

    it(`Release year.
      - Games must match at least one release year.`, () => {
      const filterBy = 'Release Year'
      const filterValues = ['2009', '2021']
      const scoped = 'Bat'

      if (scoped) {
        cy.contains('label', 'Find')
          .parent()
          .get('input[name="nameFilter"]')
          .type(scoped)
      }

      cy.contains('label', 'Filter By').parent().click()

      cy.get('[role="listbox"]').contains('li', filterBy).click()
      cy.contains('label', filterBy)
        .parent()
        .as('filter')
        .find('input[role="combobox"]')
        .as('lookup')
        .click()

      for (const filter of filterValues) {
        cy.contains(new RegExp(`^${filter}$`)).click()
      }

      for (const filter of filterValues) {
        cy.get('@filter').contains(new RegExp(`^${filter}$`))
      }

      cy.get('h2 + button').click()
      cy.contains('button', 'Filter').click()

      cy.get('[data-test="GameFigure"]')
        .as('gameFigures')
        .eq(0)
        .contains('figcaption', 'Batman: Arkham Asylum')
      cy.get('[data-test="GameFigure"]')
        .as('gameFigures')
        .eq(1)
        .contains('figcaption', 'Battlefield 2042')
    })

    it(`Platform.
      - Games must match at least one platform.`, () => {
      const filterBy = 'Platform'
      const filterValues = ['Sony PlayStation 5', 'PC \\(Windows\\)']
      const scoped = 'Bat'

      if (scoped) {
        cy.contains('label', 'Find')
          .parent()
          .get('input[name="nameFilter"]')
          .type(scoped)
      }

      cy.contains('label', 'Filter By').parent().click()

      cy.get('[role="listbox"]').contains('li', filterBy).click()
      cy.contains('label', filterBy)
        .parent()
        .as('filter')
        .find('input[role="combobox"]')
        .as('lookup')
        .click()

      for (const filter of filterValues) {
        cy.contains(new RegExp(`^${filter}$`)).click()
      }

      for (const filter of filterValues) {
        cy.get('@filter').contains(new RegExp(`^${filter}$`))
      }

      cy.get('h2 + button').click()
      cy.contains('button', 'Filter').click()

      cy.get('[data-test="GameFigure"]')
        .as('gameFigures')
        .eq(0)
        .contains('figcaption', 'Batman')
      cy.get('[data-test="GameFigure"]')
        .as('gameFigures')
        .eq(1)
        .contains('figcaption', 'Batman: Arkham Asylum')
    })

    it(`Mixing filters
      - Games must match at least one filter for each filter by.`, () => {
      const filterBy = ['Release Year', 'Feature']
      const filterValues = [['2013'], ['Single Player']]
      const scoped = 'Bat'

      if (scoped) {
        cy.contains('label', 'Find')
          .parent()
          .get('input[name="nameFilter"]')
          .type(scoped)
      }

      for (const filterByName of filterBy) {
        cy.contains('label', 'Filter By').parent().click()
        cy.get('[role="listbox"]').contains('li', filterByName).click()
        cy.contains('label', filterByName)
          .parent()
          .as('filter')
          .find('input[role="combobox"]')
          .as('lookup')
          .click()

        for (const filter of filterValues[filterBy.indexOf(filterByName)]) {
          cy.contains(new RegExp(`^${filter}$`)).click()
        }

        for (const filter of filterValues[filterBy.indexOf(filterByName)]) {
          cy.get('@filter').contains(new RegExp(`^${filter}$`))
        }

        cy.get('h2 + button').click()
      }

      cy.contains('button', 'Filter').click()

      cy.get('[data-test="GameFigure"]')
        .as('gameFigures')
        .eq(0)
        .contains('figcaption', 'Batman: Arkham Origins')
    })
  })

  describe('UI.', () => {
    Cypress._.each(breakpoints, ([breakpointName, x, y]) => {
      describe(`Screen size: ${breakpointName}.`, () => {
        beforeEach(() => {
          cy.viewport(x, y)
        })

        beforeEach(() => {
          cy.fixture('librarySync.json').then((libraryData) => {
            cy.syncLibrary('test', 'test', libraryData).then((library) => {
              cy.visit(
                `/u/test/${library.body.data.syncLibrary.id}?showFilterPane=true`,
              )
            })
          })
        })

        it('Filter panel.', () => {
          cy.wait('@api')
          cy.get('[data-test="GameFigure"]').hideElement(true)
          cy.compareSnapshot({
            name: `filter-panel-open_${breakpointName}`,
          })
        })

        it(`Filter value selection.
              - Filtering possible filter values narrows down value choices.
              - Multiple values can be selected for a filter item (shown as chips).`, () => {
          cy.get('[data-test="GameFigure"]').hideElement(true)
          cy.contains('label', 'Filter By').parent().click()

          cy.get('[role="listbox"]').contains('li', 'Platform').click()
          cy.contains('label', 'Platform')
            .parent()
            .as('filter')
            .find('input[role="combobox"]')
            .as('lookup')
            .click()

          cy.get('@lookup').type('PlayStation')
          cy.compareSnapshot({
            name: `platform-filter-lookup-${breakpointName}`,
          })
          cy.contains('PlayStation 3').click()

          cy.get('@lookup').type('PlayStation')
          cy.contains('PlayStation 4').click()

          cy.get('@filter').contains('Sony PlayStation 3')
          cy.get('@filter').contains('Sony PlayStation 4')
          cy.compareSnapshot({
            name: `platform-filter-multi-selection-${breakpointName}`,
          })
        })
      })
    })
  })
})
