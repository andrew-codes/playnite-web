import { breakpoints } from '../../support/breakpoints'

// Filtering is broken; tracked in separate issue.
describe('Filtering.', () => {
  beforeEach(() => {
    cy.intercept('POST', '/api').as('api')
  })

  beforeEach(() => {
    cy.task('seedUsers')
    cy.fixture('librarySync.json').then((libraryData) => {
      cy.syncLibrary('test', 'test', libraryData).then((library) => {
        cy.visit(`/u/test/${library.body.data.syncLibrary.id}`)
      })
    })
  })

  describe('Name.', () => {
    it('Like name.', () => {
      cy.get('[aria-label="Open filter drawer"]').trigger('mouseover')
      cy.get('[aria-label="Open filter drawer"]').click()
      cy.get('[aria-label="Open filter drawer"]')
        .find('.MuiTouchRipple-root', { timeout: 3000 })
        .click({
          force: true,
        })

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
      cy.get('[aria-label="Open filter drawer"]').trigger('mouseover')
      cy.get('[aria-label="Open filter drawer"]').click()
      cy.get('[aria-label="Open filter drawer"]')
        .find('.MuiTouchRipple-root', { timeout: 3000 })
        .click({
          force: true,
        })

      cy.contains('label', 'Find')
        .parent()
        .get('input[name="nameFilter"]')
        .type('"Batman"')
      cy.contains('button', 'Filter').as('filterButton').click()
      cy.get('[data-test="GameFigure"]')
        .should('have.length', 1)
        .should('contain', 'Batman')

      cy.reload()
      cy.get('[aria-label="Open filter drawer"]').trigger('mouseover')
      cy.get('[aria-label="Open filter drawer"]').click()
      cy.get('[aria-label="Open filter drawer"]')
        .find('.MuiTouchRipple-root', { timeout: 3000 })
        .click({
          force: true,
        })

      cy.contains('label', 'Find')
        .parent()
        .get('input[name="nameFilter"]')
        .type("'Assassin's Creed III'")
      cy.contains('button', 'Filter').as('filterButton').click()
      cy.get('[data-test="GameFigure"]')
        .should('have.length', 1)
        .should('contain', "Assassin's Creed III")
    })
  })

  it(`Completion status.
      - Games must match at least one completion status.`, () => {
    const filterBy = 'Completion Status'
    const filterValues = ['Played', 'Not Played']
    const scoped = 'Batman'

    cy.get('[aria-label="Open filter drawer"]').trigger('mouseover')
    cy.get('[aria-label="Open filter drawer"]').click()
    cy.get('[aria-label="Open filter drawer"]')
      .find('.MuiTouchRipple-root', { timeout: 3000 })
      .click({
        force: true,
      })
    if (scoped) {
      cy.contains('label', 'Find')
        .parent()
        .get('input[name="nameFilter"]')
        .type(scoped)
    }

    cy.contains('label', 'Filter By').parent().click()
    cy.wait('@api')

    cy.get('[role="listbox"]').contains('li', filterBy).click()
    cy.contains('label', filterBy)
      .parent()
      .as('filter')
      .find('input[role="combobox"]')
      .as('lookup')
      .click()

    for (const filter of filterValues) {
      cy.contains('[role="option"]', filter).click()
    }

    for (const filter of filterValues) {
      cy.contains('[role="option"]', new RegExp(`^${filter}$`))
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
    const filterValues = ['Split Screen', 'Massively']
    const scoped = null

    cy.get('[aria-label="Open filter drawer"]').trigger('mouseover')
    cy.get('[aria-label="Open filter drawer"]').click()
    cy.get('[aria-label="Open filter drawer"]')
      .find('.MuiTouchRipple-root', { timeout: 3000 })
      .click({
        force: true,
      })

    if (scoped) {
      cy.contains('label', 'Find')
        .parent()
        .get('input[name="nameFilter"]')
        .type(scoped)
    }

    cy.contains('label', 'Filter By').parent().click()
    cy.wait('@api')

    cy.get('[role="listbox"]').contains('li', filterBy).click()
    cy.contains('label', filterBy)
      .parent()
      .as('filter')
      .find('input[role="combobox"]')
      .as('lookup')
      .click()

    for (const filter of filterValues) {
      cy.contains(filter).click()
    }

    for (const filter of filterValues) {
      cy.get('@filter').contains(filter)
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

    cy.get('[aria-label="Open filter drawer"]').trigger('mouseover')
    cy.get('[aria-label="Open filter drawer"]').click()
    cy.get('[aria-label="Open filter drawer"]')
      .find('.MuiTouchRipple-root', { timeout: 3000 })
      .click({
        force: true,
      })

    if (scoped) {
      cy.contains('label', 'Find')
        .parent()
        .get('input[name="nameFilter"]')
        .type(scoped)
    }

    cy.contains('label', 'Filter By').parent().click()
    cy.wait('@api')

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
      cy.get('@filter').contains(filter)
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
    const filterValues = ['PlayStation 5', 'PC (W']
    const scoped = 'Bat'

    cy.get('[aria-label="Open filter drawer"]').trigger('mouseover')
    cy.get('[aria-label="Open filter drawer"]').click()
    cy.get('[aria-label="Open filter drawer"]')
      .find('.MuiTouchRipple-root', { timeout: 3000 })
      .click({
        force: true,
      })

    if (scoped) {
      cy.contains('label', 'Find')
        .parent()
        .get('input[name="nameFilter"]')
        .type(scoped)
    }

    cy.contains('label', 'Filter By').parent().click()
    cy.wait('@api')

    cy.get('[role="listbox"]').contains('li', filterBy).click()
    cy.contains('label', filterBy)
      .parent()
      .as('filter')
      .find('input[role="combobox"]')
      .as('lookup')
      .click()

    for (const filter of filterValues) {
      cy.contains(filter).click()
    }

    for (const filter of filterValues) {
      cy.get('@filter').contains(filter)
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

    cy.get('[aria-label="Open filter drawer"]').trigger('mouseover')
    cy.get('[aria-label="Open filter drawer"]').click()
    cy.get('[aria-label="Open filter drawer"]')
      .find('.MuiTouchRipple-root', { timeout: 3000 })
      .click({
        force: true,
      })

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
        cy.get('@filter').contains(filter)
      }

      cy.get('h2 + button').click()
    }

    cy.contains('button', 'Filter').click()
    cy.wait('@api')

    cy.get('[data-test="GameFigure"]')
      .as('gameFigures')
      .eq(0)
      .contains('figcaption', 'Batman: Arkham Origins')
  })

  describe.skip('UI', () => {
    Cypress._.each(breakpoints, ([breakpointName, x, y]) => {
      describe(`Screen size: ${breakpointName}.`, () => {
        beforeEach(() => {
          cy.viewport(x, y)
        })

        it('Filter panel is hidden by default.', () => {
          cy.get('[data-test="FilterForm"]').should('not.exist')

          cy.get('[aria-label="Open filter drawer"]').trigger('mouseover')
          cy.get('[aria-label="Open filter drawer"]').click()
          cy.get('[aria-label="Open filter drawer"]')
            .find('.MuiTouchRipple-root', { timeout: 3000 })
            .click({
              force: true,
            })

          cy.compareSnapshot({
            name: `filter-panel-open_${breakpointName}`,
            cypressScreenshotOptions: {
              blackout: ['[data-test="GameFigure"] button'],
            },
          })
        })

        it(`Filter value selection.
- Games must match at least one platform.`, () => {
          cy.get('[aria-label="Open filter drawer"]').trigger('mouseover')
          cy.get('[aria-label="Open filter drawer"]').click()
          cy.get('[aria-label="Open filter drawer"]')
            .find('.MuiTouchRipple-root', { timeout: 3000 })
            .click({
              force: true,
            })

          cy.contains('label', 'Filter By').parent().click()
          cy.wait('@api')

          cy.get('[role="listbox"]').contains('li', 'Platform').click()
          cy.contains('label', 'Platform')
            .parent()
            .as('filter')
            .find('input[role="combobox"]')
            .as('lookup')
            .click()

          cy.compareSnapshot({
            name: `platform-filter-${breakpointName}`,
            cypressScreenshotOptions: {
              blackout: ['[data-test="GameFigure"] button'],
            },
          })
          cy.get('@lookup').type('PlayStation')
          cy.compareSnapshot({
            name: `platform-filter-lookup-${breakpointName}`,
            cypressScreenshotOptions: {
              blackout: ['[data-test="GameFigure"] button'],
            },
          })
          cy.contains('PlayStation 3').click()

          cy.get('@lookup').type('PlayStation')
          cy.contains('PlayStation 4').click()

          cy.get('@filter').contains('Sony PlayStation 3')
          cy.get('@filter').contains('Sony PlayStation 4')
          cy.compareSnapshot({
            name: `platform-filter-multi-selection-${breakpointName}`,
            cypressScreenshotOptions: {
              blackout: ['[data-test="GameFigure"] button'],
            },
          })
        })
      })
    })
  })
})
