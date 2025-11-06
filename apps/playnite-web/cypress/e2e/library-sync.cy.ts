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

  it.only('Syncs library when authenticated.', () => {
    cy.fixture('librarySync.json').then((libraryData) => {
      cy.signIn('test', 'test')

      // Call mutation (publishes MQTT message)
      cy.request({
        method: 'POST',
        url: '/api',
        body: {
          query: `mutation($libraryData: LibraryInput!) {
            syncLibrary(libraryData: $libraryData) {
              id
              name
            }
          }`,
          variables: {
            libraryData,
          },
        },
      }).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body.data.syncLibrary).to.exist

        // Extract numeric ID from format "Library:1"
        const libraryId = parseInt(
          response.body.data.syncLibrary.id.split(':')[1],
          10,
        )

        // Get userId from the test user
        cy.task('getUserId', 'test').then((userId) => {
          // Verify MQTT message was published
          cy.task('verifyMqttMessage', {
            topic: 'playnite-web/library/sync',
            expectedPayload: {
              libraryId,
              userId,
            },
            timeout: 5000,
          }).then((result) => {
            expect(result).to.be.true
          })
        })
      })
    })
  })

  it('Sync multiple times.', () => {
    cy.signIn('test', 'test')
  })
  cy.fixture('librarySync.json').then((libraryData) => {
    // First sync
    cy.request({
      method: 'POST',
      url: '/api',
      body: {
        query: `mutation($libraryData: LibraryInput!) {
          syncLibrary(libraryData: $libraryData) {
            id
            name
          }
        }`,
        variables: {
          libraryData,
        },
      },
    }).then((firstResponse) => {
      expect(firstResponse.status).to.eq(200)
      expect(firstResponse.body.data.syncLibrary).to.exist

      const libraryId = parseInt(
        firstResponse.body.data.syncLibrary.id.split(':')[1],
        10,
      )

      // Get userId from the test user
      cy.task('getUserId', 'test').then((userId) => {
        // Verify first MQTT message was published
        cy.task('verifyMqttMessage', {
          topic: 'playnite-web/library/sync',
          expectedPayload: {
            libraryId,
            userId,
          },
          timeout: 5000,
        }).then((result) => {
          expect(result).to.be.true

          // Second sync with same data
          cy.request({
            method: 'POST',
            url: '/api',
            body: {
              query: `mutation($libraryData: LibraryInput!) {
                syncLibrary(libraryData: $libraryData) {
                  id
                  name
                }
              }`,
              variables: {
                libraryData,
              },
            },
          }).then((secondResponse) => {
            expect(secondResponse.status).to.eq(200)
            expect(secondResponse.body.data.syncLibrary).to.exist

            // Verify second MQTT message was published
            cy.task('verifyMqttMessage', {
              topic: 'playnite-web/library/sync',
              expectedPayload: {
                libraryId,
                userId,
              },
              timeout: 5000,
            }).then((result) => {
              expect(result).to.be.true
            })
          })
        })
      })
    })
  })
})
