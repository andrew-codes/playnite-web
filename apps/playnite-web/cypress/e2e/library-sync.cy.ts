/* eslint-disable @typescript-eslint/no-unused-expressions */

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

  it.only('Syncs library when authenticated.', () => {
    cy.fixture('librarySync.json').then((libraryData) => {
      cy.signIn('test', 'test')

      // Step 1: Call mutation (publishes MQTT message)
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
        cy.log(`${response.body.data.syncLibrary.id}`)

        // Step 2: Poll database until processing completes
        cy.task('waitForLibrarySync', {
          libraryId,
          expectedReleaseCount: libraryData.update.releases.length,
          timeout: 30000,
        }).then(() => {
          // Step 4: Query library to verify all data was synced
          cy.request({
            method: 'POST',
            url: '/api',
            body: {
              query: `query($libraryId: String!) {
                library(libraryId: $libraryId) {
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
                libraryId: response.body.data.syncLibrary.id,
              },
            },
          }).then((queryResponse) => {
            expect(queryResponse.status).to.eq(200)
            const library = queryResponse.body.data.library

            expect(library.platforms.length).to.equal(
              libraryData.update.platforms.length,
            )

            const releasesLength = library.games.reduce(
              (sum, game) => sum + game.releases.length,
              0,
            )
            expect(releasesLength).to.equal(libraryData.update.releases.length)

            expect(library.sources.length).to.equal(
              libraryData.update.sources.length,
            )

            expect(library.features.length).to.equal(
              libraryData.update.features.length,
            )

            expect(library.completionStates.length).to.equal(
              libraryData.update.completionStates.length,
            )

            expect(library.tags.length).to.equal(libraryData.update.tags.length)
          })
        })
      })
    })
  })
})

it('Syncs multiple times.', () => {
  cy.signIn('test', 'test')
  cy.fixture('librarySync.json').then((libraryData) => {
    // First sync
    cy.syncLibrary('test', 'test', libraryData).then((firstResponse) => {
      const libraryId = firstResponse.body.data.syncLibrary.id

      // Second sync with same data
      cy.request({
        method: 'POST',
        url: '/api',
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
        expect(response.status).to.eq(200)

        // Wait for second sync to complete
        cy.task('waitForLibrarySync', {
          libraryId: parseInt(
            response.body.data.syncLibrary.id.split(':')[1],
            10,
          ),
          expectedReleaseCount: libraryData.update.releases.length,
          timeout: 30000,
        }).then(() => {
          // Query library to verify data
          cy.request({
            method: 'POST',
            url: '/api',
            body: {
              query: `query($libraryId: String!) {
                  library(libraryId: $libraryId) {
                    id
                    platforms { id }
                    games { releases { id } }
                    sources { id }
                    features { id }
                    completionStates { id }
                    tags { id }
                  }
                }`,
              variables: { libraryId },
            },
          }).then((queryResponse) => {
            expect(queryResponse.status).to.eq(200)
            const library = queryResponse.body.data.library

            expect(library.platforms.length).to.equal(
              libraryData.update.platforms.length,
            )

            const releasesLength = library.games.reduce(
              (sum, game) => sum + game.releases.length,
              0,
            )
            expect(releasesLength).to.equal(libraryData.update.releases.length)

            expect(library.sources.length).to.equal(
              libraryData.update.sources.length,
            )

            expect(library.features.length).to.equal(
              libraryData.update.features.length,
            )

            expect(library.completionStates.length).to.equal(
              libraryData.update.completionStates.length,
            )

            expect(library.tags.length).to.equal(libraryData.update.tags.length)
          })
        })
      })
    })
  })
})

describe('Entity Updates from Playnite.', () => {
  // No need to sync here - the snapshot already has this data
  // Just sign in before each test
  beforeEach(() => {
    cy.signIn('test', 'test')
  })

  it(`Release title update.
      - Release title is updated correctly.
      - Creates a new game if no other game is found by the updated title.
      - Removes the old game if it contains no releases after updated.`, () => {
    cy.fixture('librarySync.json').then((libraryData) => {
      const playniteId = '38e4fe01-4224-4191-a967-c578245379f9'
      const update = {
        source: libraryData.libraryId,
        libraryId: libraryData.libraryId,
        name: libraryData.name,
        remove: {
          completionStates: [],
          features: [],
          platforms: [],
          releases: [],
          sources: [],
          tags: [],
        },
        update: {
          completionStates: [],
          features: [],
          platforms: [],
          releases: [
            {
              completionStatus: 'a8e4bb79-b2c7-4ad4-894f-c125819e55fd', // Completed
              description: 'description',
              features: [
                'c9a30422-b583-4c09-ae17-6face78a88f7',
                '0d300dc8-78a6-4d92-af6f-68918269c852',
              ],
              hidden: true,
              id: playniteId,
              playtime: '16388',
              releaseDate: '2025-08-25T00:00:00.000Z',
              source: '52ff97c9-14a6-490a-a1c6-fc4443edd918',
              tags: [libraryData.update.tags[0].id],
              title: '10 Days to Die',
            },
          ],
          sources: [],
          tags: [],
        },
      }

      cy.syncLibraryAndQuery(
        update,
        `id
          games {
            releases {
              id
              completionStatus {
                playniteId
              }
              description
              features {
                playniteId
              }
              hidden
              releaseDate
              source {
                playniteId
              }
              tags {
                playniteId
              }
              title
            }
          }`,
      ).then((library) => {
        expect(
          library.games.flatMap((g) => g.releases.map((r) => r.title)),
        ).not.to.include('7 Days to Die')

        const game = library.games.find((g) =>
          g.releases.some((r) => r.title === '10 Days to Die'),
        )

        expect(game.releases[0].title).to.eql('10 Days to Die')
        expect(game.releases[0].description).to.eql('description')
        expect(game.releases[0].hidden).to.eql(true)
        expect(game.releases[0].releaseDate).to.eql('2025-08-25')
        expect(game.releases[0].source).to.eql({
          playniteId: '52ff97c9-14a6-490a-a1c6-fc4443edd918',
        })
        expect(
          game.releases[0].tags.map((t) => t.playniteId),
        ).to.include.all.members([libraryData.update.tags[0].id])
        expect(game.releases[0].completionStatus).to.eql({
          playniteId: 'a8e4bb79-b2c7-4ad4-894f-c125819e55fd',
        })
        expect(
          game.releases[0].features.map((f) => f.playniteId),
        ).to.include.all.members([
          'c9a30422-b583-4c09-ae17-6face78a88f7',
          '0d300dc8-78a6-4d92-af6f-68918269c852',
        ])
      })
    })
  })

  it('Release updates with relations.', () => {
    cy.fixture('librarySync.json').then((libraryData) => {
      const completionStatus = libraryData.update.completionStates.find(
        (state) => state.id !== '5546b6df-a6fb-404e-bcb9-82c78fd32745',
      )
      const playniteId = '38e4fe01-4224-4191-a967-c578245379f9'
      const update = {
        source: libraryData.libraryId,
        libraryId: libraryData.libraryId,
        name: libraryData.name,
        remove: {
          completionStates: [],
          features: [],
          platforms: [],
          releases: [],
          sources: [],
          tags: [],
        },
        update: {
          completionStates: [],
          features: [],
          platforms: [],
          releases: [
            {
              completionStatus: completionStatus.id,
              description: 'description',
              features: [
                'c9a30422-b583-4c09-ae17-6face78a88f7',
                '0d300dc8-78a6-4d92-af6f-68918269c852',
              ],
              hidden: true,
              id: playniteId,
              playtime: '16381',
              releaseDate: '2025-08-25T00:00:00.000Z',
              source: '52ff97c9-14a6-490a-a1c6-fc4443edd918',
              tags: [libraryData.update.tags[0].id],
              title: '7 Days to Die',
            },
          ],
          sources: [],
          tags: [],
        },
      }

      cy.syncLibraryAndQuery(
        update,
        `id
          games {
            releases {
              id
              completionStatus {
                playniteId
              }
              description
              features {
                playniteId
              }
              hidden
              releaseDate
              source {
                playniteId
              }
              tags {
                playniteId
              }
              title
            }
          }`,
      ).then((library) => {
        const releasesLength = library.games.reduce(
          (sum, game) => sum + game.releases.length,
          0,
        )
        expect(releasesLength).to.equal(libraryData.update.releases.length)

        const release = library.games[1].releases[0]
        expect(release.completionStatus.playniteId).to.equal(
          completionStatus.id,
        )
        expect(release.description).to.equal('description')
        expect(
          release.features.map((f) => f.playniteId),
        ).to.contain.all.members([
          'c9a30422-b583-4c09-ae17-6face78a88f7',
          '0d300dc8-78a6-4d92-af6f-68918269c852',
        ])
        expect(release.hidden).to.equal(true)
        expect(release.releaseDate).to.equal('2025-08-25')
        expect(release.source.playniteId).to.equal(
          '52ff97c9-14a6-490a-a1c6-fc4443edd918',
        )
        expect(release.tags.map((t) => t.playniteId)).to.contain.all.members([
          libraryData.update.tags[0].id,
        ])
        expect(release.title).to.equal('7 Days to Die')
      })
    })
  })

  it(`Release updates without relations.
      - Resets relations to empty values.`, () => {
    cy.fixture('librarySync.json').then((libraryData) => {
      const completionStatus = libraryData.update.completionStates.find(
        (state) => state.id !== '5546b6df-a6fb-404e-bcb9-82c78fd32745',
      )
      const playniteId = '38e4fe01-4224-4191-a967-c578245379f9'
      const update = {
        source: libraryData.libraryId,
        libraryId: libraryData.libraryId,
        name: libraryData.name,
        remove: {
          completionStates: [],
          features: [],
          platforms: [],
          releases: [],
          sources: [],
          tags: [],
        },
        update: {
          completionStates: [],
          features: [],
          platforms: [],
          releases: [
            {
              completionStatus: completionStatus.id,
              description: 'description',
              features: null,
              hidden: true,
              id: playniteId,
              playtime: '16381',
              releaseDate: '2025-08-25T00:00:00.000Z',
              source: '52ff97c9-14a6-490a-a1c6-fc4443edd918',
              tags: null,
              title: '7 Days to Die',
            },
          ],
          sources: [],
          tags: [],
        },
      }

      cy.syncLibraryAndQuery(
        update,
        `id
          games {
            releases {
              id
              completionStatus {
                playniteId
              }
              description
              features {
                playniteId
              }
              hidden
              releaseDate
              source {
                playniteId
              }
              tags {
                playniteId
              }
              title
            }
          }`,
      ).then((library) => {
        const releasesLength = library.games.reduce(
          (sum, game) => sum + game.releases.length,
          0,
        )
        expect(releasesLength).to.equal(libraryData.update.releases.length)

        const release = library.games[1].releases[0]
        expect(release.completionStatus.playniteId).to.equal(
          completionStatus.id,
        )
        expect(release.description).to.equal('description')
        expect(release.features).to.have.length(0)
        expect(release.hidden).to.equal(true)
        expect(release.releaseDate).to.equal('2025-08-25')
        expect(release.source.playniteId).to.equal(
          '52ff97c9-14a6-490a-a1c6-fc4443edd918',
        )
        expect(release.tags).to.be.empty
        expect(release.title).to.equal('7 Days to Die')
      })
    })
  })

  it('Platform updates.', () => {
    cy.fixture('librarySync.json').then((libraryData) => {
      const update = {
        source: libraryData.libraryId,
        libraryId: libraryData.libraryId,
        name: libraryData.name,
        remove: {
          completionStates: [],
          features: [],
          platforms: [],
          releases: [],
          sources: [],
          tags: [],
        },
        update: {
          completionStates: [],
          features: [],
          platforms: [
            {
              id: 'c28acb88-ba16-4899-bcb1-324250ef1a28',
              name: 'GameCube',
            },
            {
              id: '258e8ff9-2b03-49ef-ad30-1f3461dfd7bc',
              name: 'SNES',
            },
          ],
          releases: [],
          sources: [],
          tags: [],
        },
      }

      cy.syncLibraryAndQuery(
        update,
        `id
          platforms {
            playniteId
            name
          }`,
      ).then((library) => {
        const gameCube = library.platforms.find(
          (p) => p.playniteId === 'c28acb88-ba16-4899-bcb1-324250ef1a28',
        )
        const snes = library.platforms.find(
          (p) => p.playniteId === '258e8ff9-2b03-49ef-ad30-1f3461dfd7bc',
        )
        expect(gameCube).to.exist
        expect(gameCube.name).to.equal('GameCube')
        expect(snes).to.exist
        expect(snes.name).to.equal('SNES')
      })
    })
  })

  it('Source updates.', () => {
    cy.fixture('librarySync.json').then((libraryData) => {
      const update = {
        source: libraryData.libraryId,
        libraryId: libraryData.libraryId,
        name: libraryData.name,
        remove: {
          completionStates: [],
          features: [],
          platforms: [],
          releases: [],
          sources: [],
          tags: [],
        },
        update: {
          completionStates: [],
          features: [],
          platforms: [],
          releases: [],
          sources: [
            {
              id: '8be14880-bd74-463f-b9b3-cf6b1cfede38',
              name: 'Sony PlayStation',
              platform: '0d309d14-6645-4e93-93ab-b50750d77c46',
            },
          ],
          tags: [],
        },
      }

      cy.syncLibraryAndQuery(
        update,
        `id
          sources {
            playniteId
            name
          }
          games {
            releases {
              platform {
                playniteId
              }
              source {
                playniteId
              }
            }
          }`,
      ).then((library) => {
        const playStation = library.sources.find(
          (s) => s.playniteId === '8be14880-bd74-463f-b9b3-cf6b1cfede38',
        )
        expect(playStation).to.exist
        expect(playStation.name).to.equal('Sony PlayStation')

        const releases = library.games.flatMap((g) => g.releases)
        expect(releases.map((r) => r.platform.playniteId)).not.to.contain(
          '72f01268-1ea4-431f-887e-ee5bfa7e6e6f',
        )
        expect(
          releases.filter(
            (r) =>
              r.platform.playniteId === '0d309d14-6645-4e93-93ab-b50750d77c46',
          ).length,
        ).to.equal(
          libraryData.update.releases.filter(
            (r) => r.source === '8be14880-bd74-463f-b9b3-cf6b1cfede38',
          ).length,
        )
      })
    })
  })

  it('Completion Status updates.', () => {
    cy.fixture('librarySync.json').then((libraryData) => {
      const update = {
        source: libraryData.libraryId,
        libraryId: libraryData.libraryId,
        name: libraryData.name,
        remove: {
          completionStates: [],
          features: [],
          platforms: [],
          releases: [],
          sources: [],
          tags: [],
        },
        update: {
          completionStates: [
            { id: '5546b6df-a6fb-404e-bcb9-82c78fd32745', name: 'Done' }, // Update played
          ],
          features: [],
          platforms: [],
          releases: [],
          sources: [],
          tags: [],
        },
      }

      cy.syncLibraryAndQuery(
        update,
        `id
          completionStates {
            playniteId
            name
          }
          games {
            releases {
              completionStatus {
                name
              }
            }
          }`,
      ).then((library) => {
        const completionStatus = library.completionStates.find(
          (cs) => cs.playniteId === '5546b6df-a6fb-404e-bcb9-82c78fd32745',
        )
        expect(completionStatus).to.exist
        expect(completionStatus.name).to.equal('Done')

        const releases = library.games.flatMap((g) => g.releases)
        expect(releases.map((r) => r.completionStatus?.name)).not.to.contain(
          'Played',
        )
        expect(releases.map((r) => r.completionStatus?.name)).to.contain('Done')
      })
    })
  })

  it('Feature updates.', () => {
    cy.fixture('librarySync.json').then((libraryData) => {
      const update = {
        source: libraryData.libraryId,
        libraryId: libraryData.libraryId,
        name: libraryData.name,
        remove: {
          completionStates: [],
          features: [],
          platforms: [],
          releases: [],
          sources: [],
          tags: [],
        },
        update: {
          completionStates: [],
          features: [
            {
              id: '0d300dc8-78a6-4d92-af6f-68918269c852',
              name: 'Split Screen Co-op',
            },
          ],
          platforms: [],
          releases: [],
          sources: [],
          tags: [],
        },
      }

      cy.syncLibraryAndQuery(
        update,
        `id
          features {
            playniteId
            name
          }`,
      ).then((library) => {
        const feature = library.features.find(
          (f) => f.playniteId === '0d300dc8-78a6-4d92-af6f-68918269c852',
        )
        expect(feature).to.exist
        expect(feature.name).to.equal('Split Screen Co-op')
      })
    })
  })

  it('Tag updates.', () => {
    cy.fixture('librarySync.json').then((libraryData) => {
      const update = {
        source: libraryData.libraryId,
        libraryId: libraryData.libraryId,
        name: libraryData.name,
        remove: {
          completionStates: [],
          features: [],
          platforms: [],
          releases: [],
          sources: [],
          tags: [],
        },
        update: {
          completionStates: [],
          features: [],
          platforms: [],
          releases: [],
          sources: [],
          tags: [
            {
              id: 'd4a19d2d-61d9-49a8-9b79-eb93acd7486b',
              name: 'Awesome',
            },
          ],
        },
      }

      cy.syncLibraryAndQuery(
        update,
        `id
          tags {
            playniteId
            name
          }`,
      ).then((library) => {
        const tag = library.tags.find(
          (f) => f.playniteId === 'd4a19d2d-61d9-49a8-9b79-eb93acd7486b',
        )
        expect(tag).to.exist
        expect(tag.name).to.equal('Awesome')
      })
    })
  })
})

describe('Entity removals from Playnite.', () => {
  // No need to sync here - the snapshot already has this data
  // Just sign in before each test
  beforeEach(() => {
    cy.signIn('test', 'test')
  })

  it(`Remove release.
      - Removes release.
      - Removes game if there are no releases for the game after removal.`, () => {
    cy.fixture('librarySync.json').then((libraryData) => {
      const remove = {
        source: libraryData.libraryId,
        libraryId: libraryData.libraryId,
        name: libraryData.name,
        remove: {
          completionStates: [],
          features: [],
          platforms: [],
          releases: [
            '38e4fe01-4224-4191-a967-c578245379f9', // 7 Days to Die, only one.
            'e8aeb6e9-ea65-48d8-a344-4c4399025081', // Fallout 4, more than one.
          ],
          sources: [],
          tags: [],
        },
        update: {
          completionStates: [],
          features: [],
          platforms: [],
          releases: [],
          sources: [],
          tags: [],
        },
      }

      cy.syncLibraryAndQuery(
        remove,
        `id
          games {
            primaryRelease {
              title
            }
            releases {
              playniteId
              title
            }
          }`,
      ).then((library) => {
        expect(library.games.map((g) => g.primaryRelease.title)).to.not.include(
          '7 Days to Die',
        )
        expect(
          library.games.find((g) =>
            g.releases.some((r) => r.title === 'Fallout 4'),
          ).releases.length,
        ).to.equal(1)
      })
    })
  })

  it(`Remove platform.
      - Errors if there are any releases with the platform (found via source).
      - Otherwise, removes platform.`, () => {
    cy.fixture('librarySync.json').then((libraryData) => {
      const remove = {
        source: libraryData.libraryId,
        libraryId: libraryData.libraryId,
        name: libraryData.name,
        remove: {
          completionStates: [],
          features: [],
          platforms: ['72f01268-1ea4-431f-887e-ee5bfa7e6e6f'],
          releases: [],
          sources: [],
          tags: [],
        },
        update: {
          completionStates: [],
          features: [],
          platforms: [],
          releases: [],
          sources: [],
          tags: [],
        },
      }

      // First test: should error when platform has releases
      cy.request({
        method: 'POST',
        url: '/api',
        body: {
          query: `mutation($libraryData: LibraryInput!) {
              syncLibrary(libraryData: $libraryData) {
                id
              }
            }`,
          variables: {
            libraryData: remove,
          },
        },
      }).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body.errors.length).to.equal(1)
      })

      // Second test: valid removal after removing releases and source
      const validRemoval = {
        source: libraryData.libraryId,
        libraryId: libraryData.libraryId,
        name: libraryData.name,
        remove: {
          completionStates: [],
          features: [],
          platforms: ['72f01268-1ea4-431f-887e-ee5bfa7e6e6f'], // Sony PlayStation 5
          releases: libraryData.update.releases
            .filter((r) => r.source === '8be14880-bd74-463f-b9b3-cf6b1cfede38')
            .map((r) => r.id), // All PlayStation 5 releases by PlayStation source.
          sources: ['8be14880-bd74-463f-b9b3-cf6b1cfede38'], // PlayStation source
          tags: [],
        },
        update: {
          completionStates: [],
          features: [],
          platforms: [],
          releases: [],
          sources: [],
          tags: [],
        },
      }

      cy.syncLibraryAndQuery(
        validRemoval,
        `platforms {
            playniteId
          }
          sources {
            playniteId
          }
          games {
            primaryRelease {
              title
            }
            releases {
              source {
                playniteId
              }
              title
            }
          }`,
      ).then((library) => {
        expect(library.platforms.map((p) => p.playniteId)).to.not.include(
          '72f01268-1ea4-431f-887e-ee5bfa7e6e6f',
        )
        expect(library.sources.map((s) => s.playniteId)).to.not.include(
          '8be14880-bd74-463f-b9b3-cf6b1cfede38',
        )
        expect(
          library.games.flatMap((g) =>
            g.releases.map((r) => r.source.playniteId),
          ),
        ).to.not.include('8be14880-bd74-463f-b9b3-cf6b1cfede38')
      })
    })
  })

  it(`Remove sources.
      - Errors if there are any releases source.
      - Otherwise, removes items.`, () => {
    cy.fixture('librarySync.json').then((libraryData) => {
      const remove = {
        source: libraryData.libraryId,
        libraryId: libraryData.libraryId,
        name: libraryData.name,
        remove: {
          completionStates: [],
          features: [],
          platforms: [],
          releases: [],
          sources: ['10fc7915-8283-4891-9288-7b725063f7ab'],
          tags: [],
        },
        update: {
          completionStates: [],
          features: [],
          platforms: [],
          releases: [],
          sources: [],
          tags: [],
        },
      }

      // First test: should error when source has releases
      cy.request({
        method: 'POST',
        url: '/api',
        body: {
          query: `mutation($libraryData: LibraryInput!) {
              syncLibrary(libraryData: $libraryData) {
                id
              }
            }`,
          variables: {
            libraryData: remove,
          },
        },
      }).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body.errors.length).to.equal(1)
      })

      // Second test: valid removal after removing releases
      const validRemoval = {
        source: libraryData.libraryId,
        libraryId: libraryData.libraryId,
        name: libraryData.name,
        remove: {
          completionStates: [],
          features: [],
          platforms: [],
          releases: libraryData.update.releases
            .filter((r) => r.source === '10fc7915-8283-4891-9288-7b725063f7ab')
            .map((r) => r.id), // All releases by Epic source.
          sources: ['10fc7915-8283-4891-9288-7b725063f7ab'], // Epic source
          tags: [],
        },
        update: {
          completionStates: [],
          features: [],
          platforms: [],
          releases: [],
          sources: [],
          tags: [],
        },
      }

      cy.syncLibraryAndQuery(
        validRemoval,
        `platforms {
            playniteId
          }
          sources {
            playniteId
          }
          games {
            primaryRelease {
              title
            }
            releases {
              source {
                playniteId
              }
              title
            }
          }`,
      ).then((library) => {
        expect(library.platforms.map((p) => p.playniteId)).to.include(
          '2028f6dd-e109-401c-ab16-163957455795',
        )
        expect(library.sources.map((s) => s.playniteId)).to.not.include(
          '10fc7915-8283-4891-9288-7b725063f7ab',
        )
        expect(
          library.games.flatMap((g) =>
            g.releases.map((r) => r.source.playniteId),
          ),
        ).to.not.include('10fc7915-8283-4891-9288-7b725063f7ab')
      })
    })
  })

  it('Remove completion states.', () => {
    cy.fixture('librarySync.json').then((libraryData) => {
      const remove = {
        source: libraryData.libraryId,
        libraryId: libraryData.libraryId,
        name: libraryData.name,
        remove: {
          completionStates: ['a8e4bb79-b2c7-4ad4-894f-c125819e55fd'],
          features: [],
          platforms: [],
          releases: [],
          sources: [],
          tags: [],
        },
        update: {
          completionStates: [],
          features: [],
          platforms: [],
          releases: [],
          sources: [],
          tags: [],
        },
      }

      cy.syncLibraryAndQuery(
        remove,
        `completionStates {
            playniteId
          }
          games {
            releases {
              completionStatus {
                playniteId
              }
              title
            }
          }`,
      ).then((library) => {
        expect(
          library.completionStates.map((p) => p.playniteId),
        ).to.not.include('a8e4bb79-b2c7-4ad4-894f-c125819e55fd')
        expect(
          library.games.flatMap((g) =>
            g.releases.map((r) => r.completionStatus?.playniteId),
          ),
        ).to.not.include('a8e4bb79-b2c7-4ad4-894f-c125819e55fd')
      })
    })
  })

  it('Remove features.', () => {
    cy.fixture('librarySync.json').then((libraryData) => {
      const remove = {
        source: libraryData.libraryId,
        libraryId: libraryData.libraryId,
        name: libraryData.name,
        remove: {
          completionStates: [],
          features: ['c9a30422-b583-4c09-ae17-6face78a88f7'],
          platforms: [],
          releases: [],
          sources: [],
          tags: [],
        },
        update: {
          completionStates: [],
          features: [],
          platforms: [],
          releases: [],
          sources: [],
          tags: [],
        },
      }

      cy.syncLibraryAndQuery(
        remove,
        `features {
            playniteId
          }
          games {
            releases {
              features {
                playniteId
              }
            }
          }`,
      ).then((library) => {
        expect(library.features.map((p) => p.playniteId)).to.not.include(
          'c9a30422-b583-4c09-ae17-6face78a88f7',
        )
        expect(
          library.games.flatMap((g) =>
            g.releases.flatMap((r) => r.features.map((f) => f.playniteId)),
          ),
        ).to.not.include('c9a30422-b583-4c09-ae17-6face78a88f7')
      })
    })
  })

  it('Remove tags.', () => {
    cy.fixture('librarySync.json').then((libraryData) => {
      const remove = {
        source: libraryData.libraryId,
        libraryId: libraryData.libraryId,
        name: libraryData.name,
        remove: {
          completionStates: [],
          features: [],
          platforms: [],
          releases: [],
          sources: [],
          tags: ['d4a19d2d-61d9-49a8-9b79-eb93acd7486b'],
        },
        update: {
          completionStates: [],
          features: [],
          platforms: [],
          releases: [],
          sources: [],
          tags: [],
        },
      }

      cy.syncLibraryAndQuery(
        remove,
        `tags {
            playniteId
          }
          games {
            releases {
              tags {
                playniteId
              }
            }
          }`,
      ).then((library) => {
        expect(library.tags.map((p) => p.playniteId)).to.not.include(
          'd4a19d2d-61d9-49a8-9b79-eb93acd7486b',
        )
        expect(
          library.games.flatMap((g) =>
            g.releases.flatMap((r) => r.tags.map((t) => t.playniteId)),
          ),
        ).to.not.include('d4a19d2d-61d9-49a8-9b79-eb93acd7486b')
      })
    })
  })
})
