import { breakpoints } from '../../support/breakpoints'

// Filtering is broken; tracked in separate issue.
describe.skip('Filtering.', () => {
  beforeEach(() => {
    cy.intercept('POST', '/api').as('api')
  })

  describe('Browse.', () => {
    it('Filter by like name', () => {
      cy.visit('/browse')

      cy.get('[aria-label="Open filter drawer"] .MuiTouchRipple-root').click({
        force: true,
      })

      cy.contains('label', 'Find')
        .parent()
        .get('input[name="nameFilter"]')
        .type('Alan Wake')
      cy.contains('button', 'Filter').as('filterButton').click()
      cy.get('[data-test="GameFigure"]')
        .should('have.length', 1)
        .should('contain', 'Alan Wake Remastered')
    })

    it('Filter by exact match name', () => {
      cy.visit('/browse')
      cy.get('[aria-label="Open filter drawer"] .MuiTouchRipple-root').click({
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
    })

    it('Filter by exact match name containing exact match characters', () => {
      cy.visit('/browse')
      cy.get('[aria-label="Open filter drawer"] .MuiTouchRipple-root').click({
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

    it(`Filter by completion status
      - Games must match at least one completion status.`, () => {
      const filterBy = 'Completion Status'
      const filterValues = ['Beaten', 'Completed']
      const scoped = 'Final Fantasy'

      cy.visit('/browse')

      cy.get('[aria-label="Open filter drawer"] .MuiTouchRipple-root')
        .as('openFilterButton')
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
      cy.wait('@api')

      cy.get('[data-test="GameFigure"]')
        .as('gameFigures')
        .eq(0)
        .contains('figcaption', 'Final Fantasy VII Remake')
      cy.get('[data-test="GameFigure"]')
        .as('gameFigures')
        .eq(1)
        .contains('figcaption', 'Final Fantasy XVI')
    })

    it(`Filter by feature
      - Games must match at least one features.`, () => {
      const filterBy = 'Feature'
      const filterValues = ['VR Gamepad', 'Single Player']
      const scoped = null

      cy.visit('/browse')

      cy.get('[aria-label="Open filter drawer"] .MuiTouchRipple-root')
        .as('openFilterButton')
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
      cy.wait('@api')

      cy.get('[data-test="GameFigure"]')
        .as('gameFigures')
        .eq(0)
        .contains('figcaption', '3DMark')
      cy.get('[data-test="GameFigure"]')
        .as('gameFigures')
        .eq(1)
        .contains('figcaption', '7 Days to Die')
    })

    it(`Filter by release year
      - Games must match at least one release year.`, () => {
      const filterBy = 'Release Year'
      const filterValues = ['2009', '2021']
      const scoped = 'Bat'

      cy.visit('/browse')

      cy.get('[aria-label="Open filter drawer"] .MuiTouchRipple-root')
        .as('openFilterButton')
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
      cy.wait('@api')

      cy.get('[data-test="GameFigure"]')
        .as('gameFigures')
        .eq(0)
        .contains('figcaption', 'Batman: Arkham Asylum')
      cy.get('[data-test="GameFigure"]')
        .as('gameFigures')
        .eq(1)
        .contains('figcaption', 'Battlefield 2042')
    })

    it(`Mixing filters
      - Games must match at least one filter for each filter by.`, () => {
      const filterBy = ['Release Year', 'Feature']
      const filterValues = [['2013'], ['Single Player']]
      const scoped = 'Bat'

      cy.visit('/browse')

      cy.get('[aria-label="Open filter drawer"] .MuiTouchRipple-root')
        .as('openFilterButton')
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

    Cypress._.each(breakpoints, ([breakpointName, x, y]) => {
      describe(`Screen size: ${breakpointName}.`, () => {
        beforeEach(() => {
          cy.viewport(x, y)
        })

        it('Filter panel is hidden by default', () => {
          cy.visit('/browse')

          cy.get('[data-test="FilterForm"]').should('not.exist')

          cy.get(
            '[aria-label="Open filter drawer"] .MuiTouchRipple-root',
          ).click({
            force: true,
          })

          cy.compareSnapshot({
            name: `filter-panel-open_${breakpointName}`,
            cypressScreenshotOptions: {
              onBeforeScreenshot($el) {
                Cypress.$('[data-test="GameFigure"]').css(
                  'color',
                  'transparent',
                )
              },
            },
          })
        })

        it(`Filter by platform
- Games must match at least one platform.`, () => {
          cy.visit('/browse')
          cy.get('[aria-label="Open filter drawer"] .MuiTouchRipple-root')
            .as('openFilterButton')
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

          cy.get('@lookup').type('PlayStation')
          cy.compareSnapshot({
            name: `platform-filter_lookup_${breakpointName}`,
            cypressScreenshotOptions: {
              onBeforeScreenshot($el) {
                Cypress.$('[data-test="GameFigure"]').css(
                  'color',
                  'transparent',
                )
              },
            },
          })
          cy.contains('PlayStation 3').click()

          cy.get('@lookup').type('PlayStation')
          cy.contains('PlayStation 4').click()

          cy.get('@filter').contains('Sony PlayStation 3')
          cy.get('@filter').contains('Sony PlayStation 4')

          cy.get('h2 + button').click()
          cy.contains('button', 'Filter').click()
          cy.wait('@api')

          cy.get('[data-test="GameFigureChipList"]').then((els) => {
            els.each((_, listEl) => {
              const platformImages = Array.from(
                listEl.querySelectorAll('img').values(),
              )
              const morePlatforms = listEl.querySelector(':not(img)')
              expect(
                platformImages.some((platformImage) => {
                  return (
                    platformImage.attributes['alt'].value.includes(
                      'PlayStation 3',
                    ) ||
                    platformImage.attributes['alt'].value.includes(
                      'PlayStation 4',
                    )
                  )
                }) || morePlatforms !== null,
              ).to.be.true
            })
          })

          cy.get('@openFilterButton').click({ force: true })
          cy.compareSnapshot({
            name: `filter-by-platform-selection_${breakpointName}`,
            cypressScreenshotOptions: {
              onBeforeScreenshot($el) {
                Cypress.$('[data-test="GameFigure"]').css(
                  'color',
                  'transparent',
                )
              },
            },
          })
        })
      })
    })
  })
})
