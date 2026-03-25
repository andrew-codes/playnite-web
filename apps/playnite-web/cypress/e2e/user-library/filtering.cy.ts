import { breakpoints } from '../../support/breakpoints'

// Filtering is broken; tracked in separate issue.
describe('Filtering.', () => {
  describe('Filter button opens filter pane.', () => {
    Cypress._.each(breakpoints, ([breakpointName, x, y]) => {
      beforeEach(() => {
        cy.viewport(x, y)
      })

      it(`${breakpointName}.
    - Is navigable by URL.`, () => {
        cy.visit(`/u/test/Library:1`)

        cy.get('[aria-label="Open filter drawer"]').click({ force: true })
        cy.contains('h4', 'Filters', { timeout: 10000 }).should('be.visible')
      })
    })
  })

  describe('Filter pane opened.', () => {
    beforeEach(() => {
      cy.visit(`/u/test/Library:1`)

      cy.get('[aria-label="Open filter drawer"]').click({ force: true })
      cy.contains('h4', 'Filters', { timeout: 10000 }).should('be.visible')
    })

    describe('Name.', () => {
      it('Like name.', () => {
        cy.contains('label', 'Find')
          .parent()
          .get('input[name="nameFilter"]')
          .type('Alan')
        cy.contains('button', 'Filter').as('filterButton').click()

        cy.location('pathname').should('equal', '/u/test/Library%3A1', {
          timeout: 2000,
        })
        cy.location('search').should('include', 'nameFilter=Alan')
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

        cy.location('pathname').should('equal', '/u/test/Library%3A1', {
          timeout: 2000,
        })
        cy.location('search').should('include', 'nameFilter=')
        cy.get('[data-test="GameFigure"]')
          .should('have.length', 1)
          .should('contain', 'Batman')
      })

      it('Filters persist after page refresh.', () => {
        cy.contains('label', 'Find')
          .parent()
          .get('input[name="nameFilter"]')
          .type('Alan')
        cy.contains('button', 'Filter').as('filterButton').click()

        cy.location('search').should('include', 'nameFilter=Alan')
        cy.get('[data-test="GameFigure"]')
          .should('have.length', 1)
          .should('contain', 'Alan Wake Remastered')

        cy.reload()

        cy.get('[data-test="GameFigure"]')
          .should('have.length', 1)
          .should('contain', 'Alan Wake Remastered')
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

      cy.get('[data-test="GameFigure"]').should('have.length', 6)
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

    it(`Critic Score.
      - Games must have a critic score within at least one selected range.`, () => {
      const filterBy = 'Critic Score'
      const filterValues = ['Masterpiece']

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
        cy.get('@filter').contains(new RegExp(`^${filter}$`))
      }

      cy.get('h2 + button').click()
      cy.contains('button', 'Filter').click()

      cy.get('[data-test="GameFigure"]').should('have.length', 1)
      cy.get('[data-test="GameFigure"]')
        .eq(0)
        .contains('figcaption', 'Batman: Arkham Origins')
    })

    it(`Community Score.
      - Games must have a community score within at least one selected range.`, () => {
      const filterBy = 'Community Score'
      const filterValues = ['Ok']

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
        cy.get('@filter').contains(new RegExp(`^${filter}$`))
      }

      cy.get('h2 + button').click()
      cy.contains('button', 'Filter').click()

      cy.get('[data-test="GameFigure"]').should('have.length', 1)
      cy.get('[data-test="GameFigure"]')
        .eq(0)
        .contains('figcaption', 'Batman: Arkham City')
    })

    it(`Score filter options.
      - All seven preset score ranges are shown.`, () => {
      const filterBy = 'Critic Score'

      cy.contains('label', 'Filter By').parent().click()

      cy.get('[role="listbox"]').contains('li', filterBy).click()
      cy.contains('label', filterBy)
        .parent()
        .as('filter')
        .find('input[role="combobox"]')
        .as('lookup')
        .click()

      cy.get('[role="option"]').should('have.length', 7)
      cy.contains('[role="option"]', /^Masterpiece$/)
      cy.contains('[role="option"]', /^Amazing$/)
      cy.contains('[role="option"]', /^Great$/)
      cy.contains('[role="option"]', /^Good$/)
      cy.contains('[role="option"]', /^Ok$/)
      cy.contains('[role="option"]', /^Mediocre$/)
      cy.contains('[role="option"]', /^Bad$/)

      cy.get('h2 + button').click()
    })

    it(`Genre.
      - Games must match at least one genre.`, () => {
      const filterBy = 'Genre'
      const filterValues = ['Action']
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
    })

    it(`Series.
      - Games must match at least one series.`, () => {
      const filterBy = 'Series'
      const filterValues = ['Batman']
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
        cy.contains('[role="option"]', new RegExp(`^${filter}$`)).click()
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
    })

    it(`Series filter options.
      - Only series with games are shown.`, () => {
      const filterBy = 'Series'

      cy.contains('label', 'Filter By').parent().click()

      cy.get('[role="listbox"]').contains('li', filterBy).click()
      cy.contains('label', filterBy)
        .parent()
        .as('filter')
        .find('input[role="combobox"]')
        .as('lookup')
        .click()

      cy.get('[role="option"]').should('have.length', 2)
      cy.contains('[role="option"]', /^Batman$/)
      cy.contains('[role="option"]', /^Mass Effect$/)

      cy.get('h2 + button').click()
    })

    it(`Genre filter options.
      - Only genres with games are shown.`, () => {
      const filterBy = 'Genre'

      cy.contains('label', 'Filter By').parent().click()

      cy.get('[role="listbox"]').contains('li', filterBy).click()
      cy.contains('label', filterBy)
        .parent()
        .as('filter')
        .find('input[role="combobox"]')
        .as('lookup')
        .click()

      cy.get('[role="option"]').should('have.length', 2)
      cy.contains('[role="option"]', /^Action$/)
      cy.contains('[role="option"]', /^Adventure$/)

      cy.get('h2 + button').click()
    })

    it(`Platform filter options.
      - Only platforms with games are shown.`, () => {
      const filterBy = 'Platform'

      cy.contains('label', 'Filter By').parent().click()

      cy.get('[role="listbox"]').contains('li', filterBy).click()
      cy.contains('label', filterBy)
        .parent()
        .as('filter')
        .find('input[role="combobox"]')
        .as('lookup')
        .click()

      cy.get('[role="option"]').should('have.length', 2)
      cy.contains('[role="option"]', /^Sony PlayStation 5$/)
      cy.contains('[role="option"]', /^PC \(Windows\)$/)
      cy.contains('[role="option"]', /Nintendo/).should('not.exist')

      cy.get('h2 + button').click()
    })

    it(`Source.
      - Games must match at least one source.`, () => {
      const filterBy = 'Source'
      const filterValues = ['Epic']
      const scoped = 'Metro'

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

      cy.get('[data-test="GameFigure"]').should('have.length', 2)
      cy.get('[data-test="GameFigure"]')
        .eq(0)
        .contains('figcaption', 'Metro Exodus')
      cy.get('[data-test="GameFigure"]')
        .eq(1)
        .contains('figcaption', 'Metro Exodus Enhanced Edition')
    })

    it(`Source filter - multiple sources.
      - Games must match at least one source.`, () => {
      const filterBy = 'Source'
      const filterValues = ['Epic', 'Steam']
      const scoped = 'Metro'

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

      cy.get('[data-test="GameFigure"]').should('have.length', 4)
      cy.get('[data-test="GameFigure"]')
        .eq(0)
        .contains('figcaption', 'Metro 2033 Redux')
    })

    it(`Source filter options.
      - Only sources with games are shown.`, () => {
      const filterBy = 'Source'

      cy.contains('label', 'Filter By').parent().click()

      cy.get('[role="listbox"]').contains('li', filterBy).click()
      cy.contains('label', filterBy)
        .parent()
        .as('filter')
        .find('input[role="combobox"]')
        .as('lookup')
        .click()

      cy.get('[role="option"]').should('have.length', 3)
      cy.contains('[role="option"]', /^Epic$/)
      cy.contains('[role="option"]', /^PlayStation$/)
      cy.contains('[role="option"]', /^Steam$/)

      cy.get('h2 + button').click()
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

  describe.skip('UI.', () => {
    Cypress._.each(breakpoints, ([breakpointName, x, y]) => {
      describe(`${breakpointName}.`, () => {
        beforeEach(() => {
          cy.viewport(x, y)
        })

        describe('Filter pane opened.', () => {
          beforeEach(() => {
            cy.visit(`/u/test/Library:1/filters`)
          })

          it('Filter panel.', () => {
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
            cy.get('@lookup').type(' 5')
            cy.contains('Sony PlayStation 5').click()

            cy.get('@lookup').type('PC')
            cy.contains('PC (Windows)').click()

            cy.get('@filter').contains('Sony PlayStation 5')
            cy.get('@filter').contains('PC (Windows)')
            cy.compareSnapshot({
              name: `platform-filter-multi-selection-${breakpointName}`,
            })
          })
        })
      })
    })
  })
})
