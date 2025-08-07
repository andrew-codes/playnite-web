describe('Library Sync', () => {
  it(`Requires authentication.`, () => {
    cy.task('seedDatabase')

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
    cy.task('seedUsers')

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
        throw new Error('Finish writing assertions here')
        // expect(response.body.data.syncLibrary.sources.length).to.equal(
        //   libraryData.update.sources.length,
        // )
      })
    })
  })
})
