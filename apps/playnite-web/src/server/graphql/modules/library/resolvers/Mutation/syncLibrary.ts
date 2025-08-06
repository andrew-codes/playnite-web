import { GraphQLError } from 'graphql'
import { groupBy } from 'lodash-es'
import logger from '../../../../../logger.js'
import { fromString, hasIdentity } from '../../../../../oid.js'
import type { MutationResolvers } from './../../../../../../../.generated/types.generated.js'

function ignSlug(release: { title: string }): string {
  return release.title
    .toLowerCase()
    .replace(/[.,!?<>/|\\:$\^&*(){}\[\]"';@#`~]|--+/g, '')
    .replace(/ /g, '-')
}

export const syncLibrary: NonNullable<
  MutationResolvers['syncLibrary']
> = async (_parent, _arg, _ctx) => {
  const userOid = fromString(_ctx.jwt?.payload.id)
  if (hasIdentity(userOid) === false) {
    throw new GraphQLError(`Invalid user ID: ${_ctx.jwt?.payload.id}`)
  }

  logger.info(
    `Syncing library for user ${userOid.id}`,
    _arg.libraryData.libraryId,
    _arg.libraryData.name,
  )
  logger.silly(`Library data`, _arg.libraryData)

  let library = await _ctx.db.library.upsert({
    where: {
      playniteId_userId: {
        playniteId: _arg.libraryData.libraryId,
        userId: userOid.id,
      },
    },
    create: {
      playniteId: _arg.libraryData.libraryId,
      userId: userOid.id,
      name: _arg.libraryData.name ?? 'Default Library',
    },
    update: {
      name: _arg.libraryData.name ?? 'Default Library',
    },
  })

  const libraryId = library.id
  logger.info(`Library ID: ${libraryId}`)

  logger.info(
    `Removing features from library ${libraryId}`,
    _arg.libraryData.remove.features,
  )
  // Removals
  // Features
  await _ctx.db.feature.deleteMany({
    where: {
      libraryId,
      playniteId: {
        in: _arg.libraryData.remove.features,
      },
    },
  })

  logger.info(
    `Removing sources from library ${libraryId}`,
    _arg.libraryData.remove.sources,
  )
  //  Sources
  await _ctx.db.source.deleteMany({
    where: {
      libraryId,
      playniteId: {
        in: _arg.libraryData.remove.sources,
      },
    },
  })

  logger.info(
    `Removing platforms from library ${libraryId}`,
    _arg.libraryData.remove.platforms,
  )
  // Platforms
  await _ctx.db.platform.deleteMany({
    where: {
      libraryId,
      playniteId: {
        in: _arg.libraryData.remove.platforms,
      },
    },
  })

  logger.info(
    `Removing tags from library ${libraryId}`,
    _arg.libraryData.remove.tags,
  )
  // Tags
  await _ctx.db.tag.deleteMany({
    where: {
      libraryId,
      playniteId: {
        in: _arg.libraryData.remove.tags,
      },
    },
  })

  logger.info(
    `Removing completion states from library ${libraryId}`,
    _arg.libraryData.remove.completionStates,
  )
  // CompletionStates
  await _ctx.db.completionStatus.deleteMany({
    where: {
      libraryId,
      playniteId: {
        in: _arg.libraryData.remove.completionStates,
      },
    },
  })

  logger.info(
    `Removing releases from library ${libraryId}`,
    _arg.libraryData.remove.releases,
  )
  // Releases
  await _ctx.db.release.deleteMany({
    where: {
      libraryId,
      playniteId: {
        in: _arg.libraryData.remove.releases,
      },
    },
  })

  // Games
  logger.info(`Removing games from library ${libraryId}`)
  const gamesWithNoReleases = await _ctx.db.game.findMany({
    where: {
      libraryId,
      Releases: { none: {} },
    },
    select: {
      id: true,
    },
  })
  logger.info(
    `Removing ${gamesWithNoReleases.length} games with no releases from library ${libraryId}`,
    gamesWithNoReleases,
  )
  await _ctx.db.game.deleteMany({
    where: {
      id: { in: gamesWithNoReleases.map((g) => g.id) },
    },
  })

  // Updates
  logger.info(
    `Updating library ${libraryId} with new features`,
    _arg.libraryData.update.features,
  )
  // Features
  await Promise.all(
    _arg.libraryData.update.features.map(async (feature) =>
      _ctx.db.feature.upsert({
        where: {
          playniteId_libraryId: { playniteId: feature.id, libraryId },
        },
        create: {
          playniteId: feature.id,
          name: feature.name,
          libraryId,
        },
        update: {
          name: feature.name,
        },
      }),
    ),
  )

  logger.info(
    `Updating library ${libraryId} with new platforms`,
    _arg.libraryData.update.platforms,
  )
  // Platforms
  await Promise.all(
    _arg.libraryData.update.platforms.map(async (platform) =>
      _ctx.db.platform.upsert({
        where: {
          playniteId_libraryId: { playniteId: platform.id, libraryId },
        },
        create: {
          playniteId: platform.id,
          name: platform.name,
          libraryId,
        },
        update: {
          name: platform.name,
        },
      }),
    ),
  )

  logger.info(
    `Updating library ${libraryId} with new sources`,
    _arg.libraryData.update.sources,
  )
  // Sources
  const platforms = await _ctx.db.platform.findMany({
    where: { libraryId },
    select: { id: true, playniteId: true },
    orderBy: {
      name: 'asc',
    },
  })
  await Promise.all(
    _arg.libraryData.update.sources
      .filter((source) => {
        return platforms.some((p) => p.playniteId === source.platform)
      })
      .map(async (source) =>
        _ctx.db.source.upsert({
          where: {
            playniteId_libraryId: { playniteId: source.id, libraryId },
          },
          create: {
            playniteId: source.id,
            name: source.name,
            libraryId,
            Platform: {
              connect: {
                playniteId_libraryId: {
                  playniteId: source.platform,
                  libraryId,
                },
              },
            },
          },
          update: {
            name: source.name,
          },
        }),
      ),
  )

  logger.info(
    `Updating library ${libraryId} with new tags`,
    _arg.libraryData.update.tags,
  )
  // Tags
  const tags = await Promise.all(
    _arg.libraryData.update.tags.map(async (tag) => {
      return _ctx.db.tag.upsert({
        where: { playniteId_libraryId: { playniteId: tag.id, libraryId } },
        create: {
          playniteId: tag.id,
          name: tag.name,
          libraryId,
        },
        update: {
          name: tag.name,
        },
      })
    }),
  )

  logger.info(
    `Updating library ${libraryId} with new completion states`,
    _arg.libraryData.update.completionStates,
  )
  // CompletionStates
  await Promise.all(
    _arg.libraryData.update.completionStates.map(async (status) =>
      _ctx.db.completionStatus.upsert({
        where: { playniteId_libraryId: { playniteId: status.id, libraryId } },
        create: {
          playniteId: status.id,
          name: status.name,
          libraryId,
        },
        update: {
          name: status.name,
        },
      }),
    ),
  )
  // IGN cover assets
  const coverAssets = await _ctx.db.asset.findMany({
    where: {
      type: 'cover',
      ignId: {
        in: _arg.libraryData.update.releases
          .map((r) => ignSlug(r))
          .filter((slug) => slug !== ''),
      },
    },
  })
  logger.info(
    `Persisting ${coverAssets.length} assets from library ${libraryId}`,
  )
  await Promise.all(
    coverAssets.map(async (asset) => {
      return _ctx.assets.persist(asset)
    }),
  )

  // Releases
  const sources = await _ctx.db.source.findMany({
    where: { libraryId },
    select: { id: true, playniteId: true, platformId: true },
  })
  const completionStates = await _ctx.db.completionStatus.findMany({
    where: { libraryId },
    select: { id: true, playniteId: true },
  })

  logger.debug(`Updated`, sources, completionStates, tags, platforms)
  await Promise.all(
    _arg.libraryData.update.releases
      .filter((release) => {
        return [sources.some((s) => s.playniteId === release.source)].every(
          Boolean,
        )
      })
      .map(async (release) => {
        const source = sources.find((s) => s.playniteId === release.source) as {
          id: number
          platformId: number
        }

        // logger.verbose(
        //   `Updating release ${release.id} for library ${libraryId}`,
        //   release,
        // )
        try {
          return await _ctx.db.release.upsert({
            where: {
              playniteId_libraryId: { playniteId: release.id, libraryId },
            },
            create: {
              playniteId: release.id,
              title: release.title,
              description: release.description,
              releaseDate: release.releaseDate,
              releaseYear: release.releaseDate?.getFullYear(),
              criticScore: release.criticScore,
              playTime: BigInt(release.playTime ?? '0'),
              communityScore: release.communityScore,
              Library: {
                connect: { id: libraryId },
              },
              Cover: {
                create: {
                  type: 'cover',
                  ignId: ignSlug(release),
                },
              },
              hidden: release.hidden,
              Platform: {
                connect: {
                  id: source.platformId,
                },
              },
              Source: {
                connect: {
                  id: source.id,
                },
              },
              Features: {
                connect: (release.features ?? [])
                  .filter((f) => f !== null)
                  .map((f) => {
                    return {
                      playniteId_libraryId: {
                        playniteId: f,
                        libraryId,
                      },
                    }
                  }),
              },
              CompletionStatus:
                release?.completionStatus &&
                release.completionStatus !==
                  '00000000-0000-0000-0000-000000000000'
                  ? {
                      connect: {
                        playniteId_libraryId: {
                          playniteId: release.completionStatus,
                          libraryId,
                        },
                      },
                    }
                  : undefined,
              Tags:
                release.tags?.length > 0
                  ? {
                      connect: release.tags
                        .filter((t) => t !== null)
                        .map((t) => ({
                          playniteId_libraryId: { playniteId: t, libraryId },
                        })),
                    }
                  : undefined,
            },
            update: {
              title: release.title,
              description: release.description,
              releaseDate: release.releaseDate,
              releaseYear: release.releaseDate?.getFullYear(),
              criticScore: release.criticScore,
              communityScore: release.communityScore,
              hidden: release.hidden,
              Features: {
                connect: (release.features ?? [])
                  .filter((f) => f !== null)
                  .map((f) => {
                    return {
                      playniteId_libraryId: {
                        playniteId: f,
                        libraryId,
                      },
                    }
                  }),
              },
              Platform: {
                connect: {
                  id: source.platformId,
                },
              },
              Source: {
                connect: {
                  id: source.id,
                },
              },
              CompletionStatus: release.completionStatus
                ? {
                    connect: {
                      playniteId_libraryId: {
                        playniteId: release.completionStatus,
                        libraryId,
                      },
                    },
                  }
                : undefined,
              Tags:
                release.tags?.length > 0
                  ? {
                      connect: release.tags
                        .filter((t) => t !== null)
                        .map((t) => ({
                          playniteId_libraryId: { playniteId: t, libraryId },
                        })),
                    }
                  : undefined,
            },
          })
        } catch (error) {
          // logger.error(
          //   `Error updating release ${release.id} for library ${libraryId}`,
          //   release,
          //   error,
          // )
          throw error
        }
      }),
  )

  const games = groupBy(_arg.libraryData.update.releases, 'title')
  logger.info(
    `Updating library ${libraryId} with ${Object.keys(games).length} games`,
  )
  await Promise.all(
    Object.entries(games).map(async ([title, releases]) => {
      return await _ctx.db.game.upsert({
        where: { title_libraryId: { title, libraryId } },
        create: {
          title,
          libraryId,
          Releases: {
            connect: releases.map((r) => ({
              playniteId_libraryId: { playniteId: r.id, libraryId },
            })),
          },
        },
        update: {
          Releases: {
            set: releases.map((r) => ({
              playniteId_libraryId: { playniteId: r.id, libraryId },
            })),
          },
        },
      })
    }),
  )

  if (library.platformPriority.length === 0) {
    await _ctx.db.library.update({
      where: { id: libraryId },
      data: {
        platformPriority: platforms.map((p) => p.id),
      },
    })
  }

  logger.info(`Library ${libraryId} synced successfully`)

  return library
}
