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

  it(`Syncs multiple times.`, () => {
    cy.fixture('librarySync.json').then((libraryData) => {
      cy.syncLibrary('test', 'test', libraryData)

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

  describe('Updates from Playnite.', () => {
    beforeEach(() => {
      cy.fixture('librarySync.json').then((libraryData) => {
        cy.syncLibrary('test', 'test', libraryData)
      })
    })

    it(`Release updates with relations.`, () => {
      cy.fixture('librarySync.json').then((libraryData) => {
        const completionStatus = libraryData.update.completionStates.find(
          (state) => state.id !== '5546b6df-a6fb-404e-bcb9-82c78fd32745',
        )
        const playniteId = '38e4fe01-4224-4191-a967-c578245379f9'
        const update = {
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
                playTime: '16381',
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

        cy.request({
          method: 'POST',
          url: '/api',
          body: {
            query: `mutation($libraryData: LibraryInput!) {
                      syncLibrary(libraryData: $libraryData) {
                        id
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
                        }
                      }
                    }`,
            variables: {
              libraryData: update,
            },
          },
        }).then((response) => {
          expect(response.status).to.eq(200)

          const releasesLength = response.body.data.syncLibrary.games.reduce(
            (sum, game) => sum + game.releases.length,
            0,
          )
          expect(releasesLength).to.equal(libraryData.update.releases.length)

          const release = response.body.data.syncLibrary.games[1].releases[0]
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

    it(`Release updates without relations.`, () => {
      cy.fixture('librarySync.json').then((libraryData) => {
        const completionStatus = libraryData.update.completionStates.find(
          (state) => state.id !== '5546b6df-a6fb-404e-bcb9-82c78fd32745',
        )
        const playniteId = '38e4fe01-4224-4191-a967-c578245379f9'
        const update = {
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
                playTime: '16381',
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

        cy.request({
          method: 'POST',
          url: '/api',
          body: {
            query: `mutation($libraryData: LibraryInput!) {
                      syncLibrary(libraryData: $libraryData) {
                        id
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
                        }
                      }
                    }`,
            variables: {
              libraryData: update,
            },
          },
        }).then((response) => {
          expect(response.status).to.eq(200)

          const releasesLength = response.body.data.syncLibrary.games.reduce(
            (sum, game) => sum + game.releases.length,
            0,
          )
          expect(releasesLength).to.equal(libraryData.update.releases.length)

          const release = response.body.data.syncLibrary.games[1].releases[0]
          expect(release.completionStatus.playniteId).to.equal(
            completionStatus.id,
          )
          expect(release.description).to.equal('description')
          expect(
            release.features.map((f) => f.playniteId),
          ).to.contain.all.members([
            'c9a30422-b583-4c09-ae17-6face78a88f7',
            'a6eae5e7-975b-45ba-9945-2719bbfbdd8c',
            '769e9c6c-bfe3-4f16-aa6e-2357cafb09f7',
            '0d300dc8-78a6-4d92-af6f-68918269c852',
          ])
          expect(release.hidden).to.equal(true)
          expect(release.releaseDate).to.equal('2025-08-25')
          expect(release.source.playniteId).to.equal(
            '52ff97c9-14a6-490a-a1c6-fc4443edd918',
          )
          expect(release.tags.map((t) => t.playniteId)).to.be.empty
          expect(release.title).to.equal('7 Days to Die')
        })
      })
    })

    it(`Platform updates.`, () => {
      cy.fixture('librarySync.json').then((libraryData) => {
        const update = {
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

        cy.request({
          method: 'POST',
          url: '/api',
          body: {
            query: `mutation($libraryData: LibraryInput!) {
                      syncLibrary(libraryData: $libraryData) {
                        id
                        platforms {
                          playniteId
                          name
                        }
                      }
                    }`,
            variables: {
              libraryData: update,
            },
          },
        }).then((response) => {
          expect(response.status).to.eq(200)

          const gameCube = response.body.data.syncLibrary.platforms.find(
            (p) => p.playniteId === 'c28acb88-ba16-4899-bcb1-324250ef1a28',
          )
          const snes = response.body.data.syncLibrary.platforms.find(
            (p) => p.playniteId === '258e8ff9-2b03-49ef-ad30-1f3461dfd7bc',
          )
          expect(gameCube).to.exist
          expect(gameCube.name).to.equal('GameCube')
          expect(snes).to.exist
          expect(snes.name).to.equal('SNES')
        })
      })
    })

    it(`Source updates.`, () => {
      cy.fixture('librarySync.json').then((libraryData) => {
        const update = {
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

        cy.request({
          method: 'POST',
          url: '/api',
          body: {
            query: `mutation($libraryData: LibraryInput!) {
                      syncLibrary(libraryData: $libraryData) {
                        id
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
                        }
                      }
                    }`,
            variables: {
              libraryData: update,
            },
          },
        }).then((response) => {
          expect(response.status).to.eq(200)

          const playStation = response.body.data.syncLibrary.sources.find(
            (s) => s.playniteId === '8be14880-bd74-463f-b9b3-cf6b1cfede38',
          )
          expect(playStation).to.exist
          expect(playStation.name).to.equal('Sony PlayStation')

          const releases = response.body.data.syncLibrary.games.flatMap(
            (g) => g.releases,
          )
          expect(releases.map((r) => r.platform.playniteId)).not.to.contain(
            '72f01268-1ea4-431f-887e-ee5bfa7e6e6f',
          )
          expect(
            releases.filter(
              (r) =>
                r.platform.playniteId ===
                '0d309d14-6645-4e93-93ab-b50750d77c46',
            ).length,
          ).to.equal(
            libraryData.update.releases.filter(
              (r) => r.source === '8be14880-bd74-463f-b9b3-cf6b1cfede38',
            ).length,
          )
        })
      })
    })

    it(`Feature updates.`, () => {
      cy.fixture('librarySync.json').then((libraryData) => {
        const update = {
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

        cy.request({
          method: 'POST',
          url: '/api',
          body: {
            query: `mutation($libraryData: LibraryInput!) {
                      syncLibrary(libraryData: $libraryData) {
                        id
                        features {
                          playniteId
                          name
                        }
                      }
                    }`,
            variables: {
              libraryData: update,
            },
          },
        }).then((response) => {
          expect(response.status).to.eq(200)

          const feature = response.body.data.syncLibrary.features.find(
            (f) => f.playniteId === '0d300dc8-78a6-4d92-af6f-68918269c852',
          )
          expect(feature).to.exist
          expect(feature.name).to.equal('Split Screen Co-op')
        })
      })
    })

    it(`Tag updates.`, () => {
      cy.fixture('librarySync.json').then((libraryData) => {
        const update = {
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

        cy.request({
          method: 'POST',
          url: '/api',
          body: {
            query: `mutation($libraryData: LibraryInput!) {
                      syncLibrary(libraryData: $libraryData) {
                        id
                        tags {
                          playniteId
                          name
                        }
                      }
                    }`,
            variables: {
              libraryData: update,
            },
          },
        }).then((response) => {
          expect(response.status).to.eq(200)

          const tag = response.body.data.syncLibrary.tags.find(
            (f) => f.playniteId === 'd4a19d2d-61d9-49a8-9b79-eb93acd7486b',
          )
          expect(tag).to.exist
          expect(tag.name).to.equal('Awesome')
        })
      })
    })
  })
})
