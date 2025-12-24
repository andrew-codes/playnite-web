describe(`Game details remote control.
              - Requires user to be signed in.
              - Only visible in libraries the authenticated user owns.`, () => {
  beforeEach(() => {
    cy.request({
      method: 'DELETE',
      url: '/echo',
    })
  })

  describe('Unauthenticated users.', () => {
    it(`No action controls.`, () => {
      cy.visit(`/u/test/Library:1`)
      cy.wait('@api')
      cy.wait('@api')
      cy.waitForImages(40)

      cy.get('[data-test="GameFigure"] button img').eq(0).click({ force: true })

      cy.get('[data-test="Actions"]', { timeout: 10000 })
        .children()
        .should('have.length', 0)
    })
  })

  describe('Authenticated users.', () => {
    beforeEach(() => {
      cy.task('restoreDatabaseSnapshot', 'multi-user')
      cy.signIn('test', 'test')
    })

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
          cy.wait('@api')
          cy.wait('@api')
          cy.waitForImages(40)
        })
      cy.get('[data-test="GameFigure"] button img').eq(0).click({ force: true })

      cy.get('[data-test="Actions"]', { timeout: 10000 })
        .children()
        .should('have.length', 0)
    })

    describe('With Webhook setting.', () => {
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
            cy.wait('@api')
            cy.wait('@api')
            cy.waitForImages(40)
          })
      })

      it(`Play button.
          - Is visible.
          - Buttons to play on each source of the game.
          - Graph mutation posts to webhook.
          - Playing triggers restart and stop buttons to appear.`, () => {
        cy.contains("Assassin's Creed Odyssey")
          .parents('[data-test=GameFigure]')
          .find('button img')
          .eq(0)
          .click({ force: true })

        cy.get('[data-test="Actions"] button', { timeout: 10000 })
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
          if (req.body.operationName !== 'startRelease') {
            return
          }
          cy.get('[data-test="Actions"] button').then(($btn) => {
            expect(req.body.query).to.include('startRelease')
            expect(req.body.variables.id).to.equal($btn.data('release-id'))
          })
        })
        cy.get('[data-test="Actions"] li')
          .eq(2)
          .contains('Sony PlayStation 5 via PlayStation')
          .click()

        cy.get('[data-test="Actions"] button', { timeout: 10000 }).eq(0).click()
        cy.wait('@api')

        // Wait a moment for the webhook to be posted.
        cy.wait(5000)

        cy.request({
          method: 'GET',
          url: '/echo',
        }).then((response) => {
          cy.get('[data-test="Actions"] button').then(($btn) => {
            const event = response.body
            expect(event.type).to.equal('StartReleaseRequested')
            expect(event.payload).to.nested.include({
              id: $btn.data('release-id'),
              title: "Assassin's Creed Odyssey",
              'library.name': 'Game Room',
              'platform.name': 'Sony PlayStation 5',
              'source.name': 'PlayStation',
            })
            expect(event.payload.coverUrl).to.match(/^\/cover-art\/.*\.webp$/)
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

      it(`Stop button.
          - Is visible for a starting or started game.
          - Graph mutation posts to webhook.
          - Stop and restart buttons disappear.`, () => {
        cy.contains("Assassin's Creed Odyssey")
          .parents('[data-test=GameFigure]')
          .find('button img')
          .click({ force: true })

        cy.get('[data-test="Actions"] button', { timeout: 10000 })
          .eq(0)
          .contains('PC (Windows) via Steam')
        cy.get('[data-test="Actions"] button').last().click()

        cy.get('[data-test="Actions"] li')
          .eq(1)
          .contains('PC (Windows) via Steam')
        cy.get('[data-test="Actions"] li')
          .eq(2)
          .contains('Sony PlayStation 5 via PlayStation')

        cy.get('[data-test="Actions"] li')
          .eq(2)
          .contains('Sony PlayStation 5 via PlayStation')
          .click()

        cy.get('[data-test="Actions"] button', { timeout: 10000 }).eq(0).click()
        cy.get('[data-test="Actions"] li')
          .eq(2)
          .contains('button', 'Stop game')
          .click()
        cy.get('[data-test="Actions"] li').should('have.length', 1)
        cy.wait('@api')

        // Wait a moment for the webhook to be posted.
        cy.wait(5000)

        cy.request({
          method: 'GET',
          url: '/echo',
        }).then((response) => {
          cy.get('[data-test="Actions"] button').then(($btn) => {
            const event = response.body
            expect(event.type).to.equal('StopReleaseRequested')
            expect(event.payload).to.nested.include({
              id: $btn.data('release-id'),
              title: "Assassin's Creed Odyssey",
              'library.name': 'Game Room',
              'platform.name': 'Sony PlayStation 5',
              'source.name': 'PlayStation',
            })
            expect(event.payload.coverUrl).to.match(/^\/cover-art\/.*\.webp$/)
            expect(event.payload.library.id).to.match(/Library:\d+/)
            expect(event.payload.platform.id).to.match(/Platform:\d+/)
            expect(event.payload.source.id).to.match(/Source:\d+/)
          })
        })
      })

      it(`Restart button.
          - Is visible for a starting or started game.
          - Graph mutation posts to webhook.
          - All controls remain visible.`, () => {
        cy.contains("Assassin's Creed Odyssey")
          .parents('[data-test=GameFigure]')
          .find('button img')
          .click({ force: true })

        cy.get('[data-test="Actions"] button', { timeout: 10000 })
          .eq(0)
          .contains('PC (Windows) via Steam')
        cy.get('[data-test="Actions"] button').last().click()

        cy.get('[data-test="Actions"] li')
          .eq(1)
          .contains('PC (Windows) via Steam')
        cy.get('[data-test="Actions"] li')
          .eq(2)
          .contains('Sony PlayStation 5 via PlayStation')

        cy.get('[data-test="Actions"] li')
          .eq(2)
          .contains('Sony PlayStation 5 via PlayStation')
          .click()

        cy.get('[data-test="Actions"] button', { timeout: 10000 }).eq(0).click()
        cy.get('[data-test="Actions"] li')
          .eq(1)
          .contains('button', 'Restart game')
          .click()
        cy.wait('@api')

        // Wait a moment for the webhook to be posted.
        cy.wait(5000)

        cy.request({
          method: 'GET',
          url: '/echo',
        }).then((response) => {
          cy.get('[data-test="Actions"] button').then(($btn) => {
            const event = response.body
            expect(event.type).to.equal('RestartReleaseRequested')
            expect(event.payload).to.nested.include({
              id: $btn.data('release-id'),
              title: "Assassin's Creed Odyssey",
              'library.name': 'Game Room',
              'platform.name': 'Sony PlayStation 5',
              'source.name': 'PlayStation',
            })
            expect(event.payload.coverUrl).to.match(/^\/cover-art\/.*\.webp$/)
            expect(event.payload.library.id).to.match(/Library:\d+/)
            expect(event.payload.platform.id).to.match(/Platform:\d+/)
            expect(event.payload.source.id).to.match(/Source:\d+/)
          })
        })
      })
    })
  })
})
