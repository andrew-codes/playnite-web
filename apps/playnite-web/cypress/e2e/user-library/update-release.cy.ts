describe('Update a release.', () => {
  beforeEach(() => {
    cy.intercept('GET', /\/u\/test\/.*/).as('userLibrary')
  })

  it(`Authorization.
      - Must be authenticated.
      - Release must be in authenticated user's library.`, () => {
    cy.task('restoreDatabaseSnapshot', 'multi-user')
    cy.visit(`/u/test/Library:1`)

    cy.signIn('test', 'test')

    // Query to get a release ID from Jane's library
    cy.request('POST', '/api', {
      query: `query library($id: String!) {
                    library(libraryId: $id) {
                      games {
                        primaryRelease {
                          id
                        }
                      }
                    }
                  }`,
      variables: {
        id: 'Library:2', // Jane's library
      },
    }).then((janeLibrary) => {
      cy.request({
        failOnStatusCode: false,
        method: 'POST',
        url: '/api',
        body: {
          query: `mutation MyMutation($release: ReleaseInput!) {
                    updateRelease(release: $release) {
                      id
                    }
                  }`,
          variables: {
            release: {
              id: janeLibrary.body.data.library.games[1].primaryRelease.id,
              hidden: true,
              description: 'Updated Release description',
              releaseDate: '2023-07-25T00:00:00.000Z',
            },
          },
        },
      }).then((response) => {
        expect(response.body.errors[0].message).to.eq('Release not found.')
      })
    })
  })

  it(`Invalid Oid.
    - Release Oid must be a valid format.
    - All relational properties must have valid Oids.`, () => {
    cy.signIn('test', 'test')
    cy.request('POST', '/api', {
      query: `query library($id: String!) {
                    library(libraryId: $id) {
                      completionStates {
                        id
                      }
                      sources {
                        id
                      }
                      tags {
                        id
                      }
                      features {
                        id
                      }
                      games {
                        primaryRelease {
                          id
                          completionStatus {
                            id
                          }
                          source {
                            id
                          }
                        }
                      }
                    }
                  }`,
      variables: {
        id: 'Library:1',
      },
    }).then((response) => {
      const source = response.body.data.library.sources.find(
        (source) =>
          source.id !==
          response.body.data.library.games[1].primaryRelease.source.id,
      ).id
      const features: Array<string> = []
      const tags: Array<string> = []
      const completionStatus = ''
      cy.log('Verifying release Oid')
      cy.request({
        failOnStatusCode: false,
        method: 'POST',
        url: '/api',
        body: {
          query: `mutation MyMutation($release: ReleaseInput!) {
                    updateRelease(release: $release) {
                      id
                    }
                  }`,
          variables: {
            release: {
              id: 'Release1',
              hidden: true,
              description: 'Updated Release description',
              releaseDate: '2023-07-25T00:00:00.000Z',
              source,
              features,
              tags,
              completionStatus,
            },
          },
        },
      }).then((response) => {
        expect(response.body.errors[0].message).to.eq('Invalid OID format.')
      })

      cy.log('Verifying source Oid')
      cy.request({
        failOnStatusCode: false,
        method: 'POST',
        url: '/api',
        body: {
          query: `mutation MyMutation($release: ReleaseInput!) {
                    updateRelease(release: $release) {
                      id
                    }
                  }`,
          variables: {
            release: {
              id: response.body.data.library.games[1].primaryRelease.id,
              hidden: true,
              description: 'Updated Release description',
              releaseDate: '2023-07-25T00:00:00.000Z',
              source: '1',
              features,
              tags,
              completionStatus,
            },
          },
        },
      }).then((response) => {
        expect(response.body.errors[0].message).to.eq('Invalid OID format.')
      })

      cy.log('Verifying feature Oid')
      cy.request({
        failOnStatusCode: false,
        method: 'POST',
        url: '/api',
        body: {
          query: `mutation MyMutation($release: ReleaseInput!) {
                    updateRelease(release: $release) {
                      id
                    }
                  }`,
          variables: {
            release: {
              id: response.body.data.library.games[1].primaryRelease.id,
              hidden: true,
              description: 'Updated Release description',
              releaseDate: '2023-07-25T00:00:00.000Z',
              source: source,
              features: features.concat(['1']),
              tags,
              completionStatus,
            },
          },
        },
      }).then((response) => {
        expect(response.body.errors[0].message).to.eq('Invalid OID format.')
      })

      cy.log('Verifying tag Oid')
      cy.request({
        failOnStatusCode: false,
        method: 'POST',
        url: '/api',
        body: {
          query: `mutation MyMutation($release: ReleaseInput!) {
                    updateRelease(release: $release) {
                      id
                    }
                  }`,
          variables: {
            release: {
              id: response.body.data.library.games[1].primaryRelease.id,
              hidden: true,
              description: 'Updated Release description',
              releaseDate: '2023-07-25T00:00:00.000Z',
              source: source,
              features: features,
              tags: tags.concat(['1']),
              completionStatus,
            },
          },
        },
      }).then((response) => {
        expect(response.body.errors[0].message).to.eq('Invalid OID format.')
      })

      cy.log('Verifying completionStatus Oid')
      cy.request({
        failOnStatusCode: false,
        method: 'POST',
        url: '/api',
        body: {
          query: `mutation MyMutation($release: ReleaseInput!) {
                    updateRelease(release: $release) {
                      id
                    }
                  }`,
          variables: {
            release: {
              id: response.body.data.library.games[1].primaryRelease.id,
              hidden: true,
              description: 'Updated Release description',
              releaseDate: '2023-07-25T00:00:00.000Z',
              source: source,
              features: features,
              tags: tags,
              completionStatus: '1',
            },
          },
        },
      }).then((response) => {
        expect(response.body.errors[0].message).to.eq('Invalid OID format.')
      })
    })
  })

  it(`Updated.
    - Fields are updated.
    - Relational fields can be updated.
    - UI is notified and updates with latest changes.`, () => {
    cy.signIn('test', 'test')
    cy.visit(`/u/test/Library:1`)
    cy.get('[data-test=GameFigure]').eq(1).find('button img').parent().click()
    cy.wait('@api')

    cy.contains('h2', 'HOW LONG WILL YOU SURVIVE?').should('be.visible')

    cy.request('POST', '/api', {
      query: `query library($id: String!) {
                    library(libraryId: $id) {
                      features {
                        id
                      }
                      sources {
                        id
                      }
                      completionStates {
                        id
                      }
                      games {
                        primaryRelease {
                          id
                          completionStatus {
                            id
                          }
                          features {
                            id
                          }
                          source {
                            id
                          }
                        }
                      }
                    }
                  }`,
      variables: {
        id: 'Library:1',
      },
    }).then((response) => {
      const source = response.body.data.library.sources.find(
        (s) =>
          s.id !== response.body.data.library.games[1].primaryRelease.source.id,
      )
      const completionStatus = response.body.data.library.completionStates.find(
        (cs) =>
          cs.id !==
          response.body.data.library.games[1].primaryRelease.completionStatus
            .id,
      )
      const features = response.body.data.library.features.filter(
        (f) =>
          !response.body.data.library.games[1].primaryRelease.features.includes(
            f.id,
          ),
      )
      cy.request({
        method: 'POST',
        url: '/api',
        body: {
          query: `mutation MyMutation($release: ReleaseInput!) {
                        updateRelease(release: $release) {
                          id
                          hidden
                          description
                          releaseDate
                          source {
                            id
                          }
                          features {
                            id
                          }
                          tags {
                            id
                          }
                          completionStatus {
                            id
                          }
                        }
                      }`,
          variables: {
            release: {
              id: response.body.data.library.games[1].primaryRelease.id,
              hidden: true,
              description: 'Updated Release description',
              releaseDate: '2023-07-25T00:00:00.000Z',
              source: source.id,
              features: features.map((f) => f.id),
              tags: [],
              completionStatus: completionStatus.id,
            },
          },
        },
      }).then((response) => {
        const release = response.body.data.updateRelease
        expect(release.hidden).to.eq(true)
        expect(release.description).to.eq('Updated Release description')
        expect(release.releaseDate).to.eq('2023-07-25')
        expect(release.source).to.deep.eq(source)
        expect(release.features.map((f) => f.id).sort()).to.contain.all.members(
          features.map((f) => f.id).sort(),
        )
        expect(release.tags).to.deep.eq([])
        expect(release.completionStatus).to.deep.eq(completionStatus)
      })
      cy.contains('div', 'Updated Release description').should('be.visible')
    })
  })
})
