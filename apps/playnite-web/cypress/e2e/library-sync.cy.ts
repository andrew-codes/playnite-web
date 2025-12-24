/* eslint-disable @typescript-eslint/no-unused-expressions */

describe('Library Sync', () => {
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
})
