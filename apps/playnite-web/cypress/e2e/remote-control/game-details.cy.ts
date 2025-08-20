import { breakpoints } from '../../support/breakpoints'

describe(`Game details remote control.
              - Requires user to be signed in.
              - Only visible in libraries the authenticated user owns.`, () => {
  beforeEach(() => {
    cy.task('seedUsers')
  })

  beforeEach(() => {
    cy.intercept('POST', '/api').as('graphql')
    cy.intercept('GET', /.*\$gameId.*/).as('getPageJs')
  })

  describe('Unauthenticated users.', () => {
    it(`No action controls.`, () => {
      cy.fixture('librarySync.json')
        .then((libraryData) => {
          return cy.syncLibrary('test', 'test', libraryData)
        })
        .then((library) => {
          cy.visit(`/u/test/${library.body.data.syncLibrary.id}`)
          cy.wait('@graphql')
        })
      cy.get('[data-test="GameFigure"] button').eq(1).click({ force: true })

      cy.wait('@graphql')
      cy.wait(6000)
      cy.get('[data-test="Actions"]').children().should('have.length', 0)
    })
  })

  describe('Authenticated users.', () => {
    it(`Non-owned library.
            - No action controls.`, () => {
      cy.fixture('librarySync.json')
        .then((libraryData) => {
          cy.syncLibrary('test', 'test', libraryData)
          cy.syncLibrary('jane', 'jane', libraryData)
        })
        .then((library) => {
          cy.signIn('test', 'test')
          cy.visit(`/u/jane/${library.body.data.syncLibrary.id}`)
          cy.wait('@graphql')
        })
      cy.get('[data-test="GameFigure"] button').eq(1).click({ force: true })
      cy.wait('@graphql')

      cy.wait(6000)
      cy.get('[data-test="Actions"]').children().should('have.length', 0)
    })

    describe.only('With Webhook setting.', () => {
      beforeEach(() => {
        cy.task('setUserSettings', {
          username: 'test',
          settings: {
            webhook: 'http://localhost:3000/echo',
          },
        })
      })

      beforeEach(() => {
        cy.fixture('librarySync.json')
          .then((libraryData) => {
            return cy.syncLibrary('test', 'test', libraryData)
          })
          .then((library) => {
            cy.signIn('test', 'test')
            cy.visit(`/u/test/${library.body.data.syncLibrary.id}`)
          })
      })

      it(`Play button.
          - Is visible.
          - Buttons to play on each source of the game.
          - Graph mutation.
          - Playing triggers restart and stop buttons to appear.`, () => {
        cy.contains("Assassin's Creed Odyssey")
          .parents('[data-test=GameFigure]')
          .find('button img')
          .click({ force: true })

        cy.get('[data-test="Actions"] button')
          .eq(0)
          .contains('PC (Windows) via Steam')
        cy.get('[data-test="Actions"] button').last().click()

        cy.get('[data-test="Actions"] li')
          .eq(1)
          .contains('PC (Windows) via Steam')
        cy.get('[data-test="Actions"] li')
          .eq(2)
          .contains('Sony PlayStation 5 via PlayStation')

        cy.intercept('POST', '/api', (req) => {
          cy.get('[data-test="Actions"] button').then(($btn) => {
            expect(req.body.query).to.include('startRelease')
            expect(req.body.variables.id).to.equal($btn.data('release-id'))
          })
        })
        cy.get('[data-test="Actions"] li')
          .eq(2)
          .contains('Sony PlayStation 5 via PlayStation')
          .click()

        cy.get('[data-test="Actions"] button').eq(0).click()
        cy.wait(300)

        cy.task<Array<any>>('readRequestLog').then((log) => {
          cy.log(JSON.stringify(log, null, 2))
          cy.get('[data-test="Actions"] button').then(($btn) => {
            const event = log[0].body
            expect(event.type).to.equal('ReleaseStarted')
            expect(event.payload).to.nested.include({
              coverUrl:
                'https://localhost:3000/public/game-assets/assassins-creed-odyssey.webp',
              id: $btn.data('release-id'),
              title: "Assassin's Creed Odyssey",
              'library.name': 'Game Room',
              'platform.name': 'Sony PlayStation 5',
              'source.name': 'PlayStation',
            })
            expect(event.payload.library.id).to.match(/Library:\d+/)
            expect(event.payload.platform.id).to.match(/Platform:\d+/)
            expect(event.payload.source.id).to.match(/Source:\d+/)
          })
        })

        cy.get('[data-test="Actions"] li')
          .eq(1)
          .contains('button', 'Restart game')
        cy.get('[data-test="Actions"] li').eq(2).contains('button', 'Stop game')
      })
    })

    describe.skip('UI.', () => {
      Cypress._.each(breakpoints, ([breakpointName, x, y]) => {
        describe(`Screen size: ${breakpointName}.`, () => {
          beforeEach(() => {
            cy.viewport(x, y)
            cy.task('setUserSettings', {
              username: 'test',
              settings: {
                webhook: 'https://localhost',
              },
            })
            cy.fixture('librarySync.json')
              .then((libraryData) => {
                return cy.syncLibrary('test', 'test', libraryData)
              })
              .then((library) => {
                cy.signIn('test', 'test')
                cy.visit(`/u/test/${library.body.data.syncLibrary.id}`)
              })
          })

          it(`Play button is visible.`, () => {
            cy.get('[data-test="GameFigure"] button')
              .eq(1)
              .click({ force: true })

            cy.get('[data-test="GameDetails"]')
              .parent()
              .compareSnapshot({
                name: `$play-button-visible_${breakpointName}`,
                cypressScreenshotOptions: {
                  onBeforeScreenshot($el) {
                    Cypress.$('[data-test="GameFigure"]').css(
                      'color',
                      'transparent',
                    )
                    $el.find('[data-test="Name"]').css('color', 'transparent')
                    $el
                      .find('[data-test="Description"]')
                      .css('color', 'transparent')
                    $el.find('img').css('visibility', 'hidden')
                  },
                },
              })
          })

          it.skip(`Restart/stop visible.
- Persists across page refreshes and navigation.
- Manually stopping a game does not impact visibility.`, () => {
            cy.get('[data-test="GameFigure"]', { timeout: 5000 })
              .first()
              .find('button span', { timeout: 5000 })
              .click({ force: true })

            cy.get('[data-test="GameDetails"]').as('gameDetails')
            cy.get('@gameDetails').contains('button', 'via').click()
            cy.get('@gameDetails')
              .parent()
              .compareSnapshot({
                name: `${locationName}_restart-stop-buttons-visible_${breakpointName}`,
                cypressScreenshotOptions: {
                  onBeforeScreenshot($el) {
                    Cypress.$('[data-test="GameFigure"]').css(
                      'color',
                      'transparent',
                    )
                    $el.find('[data-test="Name"]').css('color', 'transparent')
                    $el
                      .find('[data-test="Description"]')
                      .css('color', 'transparent')
                    $el.find('img').css('visibility', 'hidden')
                  },
                },
              })

            cy.reload()
            cy.get('[data-test="GameFigure"]', { timeout: 5000 })
              .first()
              .as('game')
            cy.get('@game')
              .find('button img', { timeout: 5000 })
              .parent()
              .click({ force: true })
            cy.wait('@api', { timeout: 5000 })

            cy.get('[data-test="GameDetails"]').as('gameDetails')
            cy.get('@gameDetails')
              .parent()
              .compareSnapshot({
                name: `${locationName}_restart-stop-buttons-visible-persist-page-refreshes_${breakpointName}`,
                cypressScreenshotOptions: {
                  onBeforeScreenshot($el) {
                    Cypress.$('[data-test="GameFigure"]').css(
                      'color',
                      'transparent',
                    )
                    $el.find('[data-test="Name"]').css('color', 'transparent')
                    $el
                      .find('[data-test="Description"]')
                      .css('color', 'transparent')
                    $el.find('img').css('visibility', 'hidden')
                  },
                },
              })

            let gameId: string | undefined
            cy.get('@game').then(($el) => {
              gameId = $el.attr('data-test-game-id')?.split(':')[1]
            })
            cy.wait(3000)

            cy.get('@gameDetails')
              .parent()
              .compareSnapshot({
                name: `${locationName}_restart-stop-buttons-visible-when-manually-stopping-game_${breakpointName}`,
                cypressScreenshotOptions: {
                  onBeforeScreenshot($el) {
                    Cypress.$('[data-test="GameFigure"]').css(
                      'color',
                      'transparent',
                    )
                    $el.find('[data-test="Name"]').css('color', 'transparent')
                    $el
                      .find('[data-test="Description"]')
                      .css('color', 'transparent')
                    $el.find('img').css('visibility', 'hidden')
                  },
                },
              })
          })

          it(`Restart/stop stopping game.
- Once a game is stopped via Playnite Web.`, () => {
            cy.get('[data-test="GameFigure"]', { timeout: 5000 })
              .first()
              .find('button img', { timeout: 5000 })
              .parent()
              .click({ force: true })

            cy.get('[data-test="GameDetails"]').as('gameDetails')
            cy.get('@gameDetails').contains('button', 'via').click()
            cy.get('@gameDetails').contains('button', 'Stop').click()

            cy.get('@gameDetails')
              .parent()
              .compareSnapshot({
                name: `${locationName}_restart-stop-stopping-game_${breakpointName}`,
                cypressScreenshotOptions: {
                  onBeforeScreenshot($el) {
                    Cypress.$('[data-test="GameFigure"]').css(
                      'color',
                      'transparent',
                    )
                    $el.find('[data-test="Name"]').css('color', 'transparent')
                    $el
                      .find('[data-test="Description"]')
                      .css('color', 'transparent')
                    $el.find('img').css('visibility', 'hidden')
                  },
                },
              })
          })
        })
      })
    })
  })
})
