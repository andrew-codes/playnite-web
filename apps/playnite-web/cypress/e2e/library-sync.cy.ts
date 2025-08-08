describe('Library Sync', () => {
  beforeEach(() => {
    cy.task('seedUsers')
  })

  it(`Requires authentication.`, () => {
    cy.fixture('librarySync.json').then((libraryData) => {
      cy.request({
        method: 'POST',
        url: '/api',
        failOnStatusCode: false,
        body: {
          query: `mutation($libraryData: LibraryInput!) {
          syncLibrary(libraryData: $libraryData) {
            id
          }
        }`,
          variables: {
            libraryData,
          },
        },
      }).then((response) => {
        expect(response.status).to.eq(401)
        expect(response.body.errors).to.exist
        expect(response.body.errors[0].message).to.eq(
          'Authorization failed for user undefined',
        )
      })
    })
  })

  it(`Syncs library when authenticated.`, () => {
    cy.fixture('librarySync.json').then((libraryData) => {
      cy.signIn('test', 'test')

      cy.request({
        method: 'POST',
        url: '/api',
        body: {
          query: `mutation($libraryData: LibraryInput!) {
            syncLibrary(libraryData: $libraryData) {
              id
              platforms {
                id
              }
              games {
                releases {
                  id
                }
              }
              sources {
                id
              }
              features {
                id
              }
              completionStates {
                id
              }
              tags {
                id
              }
            }
          }`,
          variables: {
            libraryData,
          },
        },
      }).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body.data.syncLibrary.platforms.length).to.equal(
          libraryData.update.platforms.length,
        )

        const releasesLength = response.body.data.syncLibrary.games.reduce(
          (sum, game) => sum + game.releases.length,
          0,
        )
        expect(releasesLength).to.equal(libraryData.update.releases.length)

        expect(response.body.data.syncLibrary.sources.length).to.equal(
          libraryData.update.sources.length,
        )

        expect(response.body.data.syncLibrary.features.length).to.equal(
          libraryData.update.features.length,
        )

        expect(response.body.data.syncLibrary.completionStates.length).to.equal(
          libraryData.update.completionStates.length,
        )

        expect(response.body.data.syncLibrary.tags.length).to.equal(
          libraryData.update.tags.length,
        )
      })
    })
  })
})
