import { groupBy } from 'lodash-es'
import { runState } from '../../../../../../api/client/runStates.js'
import { ignSlug } from '../../../../../assets/ignSlug.js'
import logger from '../../../../../logger.js'
import { create, domains, hasIdentity } from '../../../../../oid.js'
import type { MutationResolvers } from './../../../../../../../.generated/types.generated.js'

export const syncLibrary: NonNullable<
  MutationResolvers['syncLibrary']
> = async (_parent, _arg, _ctx) => {
  const user = await _ctx.identityService.authorize(_ctx.jwt?.payload)

  const userId = user.id
  logger.debug('User', user)
  if (!userId || !hasIdentity(userId)) {
    throw new Error('Invalid OID format.')
  }

  logger.silly(`Library data`, _arg.libraryData)
  logger.info(
    `Syncing library ${_arg.libraryData.libraryId} for user ${userId.id}`,
  )

  let library = await _ctx.db.library.upsert({
    where: {
      playniteId_userId: {
        playniteId: _arg.libraryData.libraryId,
        userId: userId.id,
      },
    },
    create: {
      playniteId: _arg.libraryData.libraryId,
      User: {
        connect: { id: userId.id },
      },
      name: _arg.libraryData.name ?? 'Default Library',
    },
    update: {
      name: _arg.libraryData.name ?? 'Default Library',
    },
  })

  const libraryId = library.id
  logger.info(`Library ID: ${libraryId}`)

  // Removals
  // Releases
  logger.debug(
    `Removing releases from library ${libraryId}`,
    _arg.libraryData.remove.releases,
  )
  const removedReleases = await _ctx.db.release.deleteMany({
    where: {
      libraryId,
      playniteId: {
        in: _arg.libraryData.remove.releases,
      },
    },
  })
  logger.debug(`Removed ${removedReleases.count} releases.`)

  // Features
  logger.debug(
    `Removing features from library ${libraryId}`,
    _arg.libraryData.remove.features,
  )
  const removedFeatures = await _ctx.db.feature.deleteMany({
    where: {
      libraryId,
      playniteId: {
        in: _arg.libraryData.remove.features,
      },
    },
  })
  logger.debug(`Removed ${removedFeatures.count} features.`)

  // Platforms
  logger.debug(
    `Removing platforms from library ${libraryId}`,
    _arg.libraryData.remove.platforms,
  )
  const deletedPlatforms = await _ctx.db.platform.deleteMany({
    where: {
      libraryId,
      playniteId: {
        in: _arg.libraryData.remove.platforms,
      },
    },
  })
  logger.debug(`Removed ${deletedPlatforms.count} platforms.`)

  //  Sources
  logger.debug(
    `Removing sources from library ${libraryId}`,
    _arg.libraryData.remove.sources,
  )
  const removedSources = await _ctx.db.source.deleteMany({
    where: {
      libraryId,
      playniteId: {
        in: _arg.libraryData.remove.sources,
      },
    },
  })
  logger.debug(`Removed ${removedSources.count} sources.`)

  // Tags
  logger.debug(
    `Removing tags from library ${libraryId}`,
    _arg.libraryData.remove.tags,
  )
  const tagsRemoved = await _ctx.db.tag.deleteMany({
    where: {
      libraryId,
      playniteId: {
        in: _arg.libraryData.remove.tags,
      },
    },
  })
  logger.debug(`Removed ${tagsRemoved.count} tags.`)

  // CompletionStates
  logger.debug(
    `Removing completion states from library ${libraryId}`,
    _arg.libraryData.remove.completionStates,
  )
  const completionStatesRemoved = await _ctx.db.completionStatus.deleteMany({
    where: {
      libraryId,
      playniteId: {
        in: _arg.libraryData.remove.completionStates,
      },
    },
  })
  logger.debug(`Removed ${completionStatesRemoved.count} completion states.`)

  // Updates
  logger.debug(
    `Updating library ${libraryId} with new features`,
    _arg.libraryData.update.features,
  )
  // Features
  const updatedFeatures = await Promise.all(
    _arg.libraryData.update.features.map(async (feature) =>
      _ctx.db.feature.upsert({
        where: {
          playniteId_libraryId: { playniteId: feature.id, libraryId },
        },
        create: {
          playniteId: feature.id,
          name: feature.name,
          Library: {
            connect: { id: libraryId },
          },
        },
        update: {
          name: feature.name,
        },
      }),
    ),
  )

  logger.debug(
    `Updating library ${libraryId} with new platforms`,
    _arg.libraryData.update.platforms,
  )
  // Platforms
  const updatedPlatforms = await Promise.all(
    _arg.libraryData.update.platforms.map(async (platform) =>
      _ctx.db.platform.upsert({
        where: {
          playniteId_libraryId: { playniteId: platform.id, libraryId },
        },
        create: {
          playniteId: platform.id,
          name: platform.name,
          Library: {
            connect: { id: libraryId },
          },
        },
        update: {
          name: platform.name,
        },
      }),
    ),
  )

  logger.debug(
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
  const updatedSources = await Promise.all(
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
            Library: {
              connect: {
                id: libraryId,
              },
            },
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
            Platform: {
              connect: {
                playniteId_libraryId: {
                  playniteId: source.platform,
                  libraryId,
                },
              },
            },
          },
        }),
      ),
  )

  logger.debug(
    `Updating library ${libraryId} with new tags`,
    _arg.libraryData.update.tags,
  )
  // Tags
  const updatedTags = await Promise.all(
    _arg.libraryData.update.tags.map(async (tag) => {
      return _ctx.db.tag.upsert({
        where: { playniteId_libraryId: { playniteId: tag.id, libraryId } },
        create: {
          playniteId: tag.id,
          name: tag.name,
          Library: {
            connect: { id: libraryId },
          },
        },
        update: {
          name: tag.name,
        },
      })
    }),
  )

  logger.debug(
    `Updating library ${libraryId} with new completion states`,
    _arg.libraryData.update.completionStates,
  )
  // CompletionStates
  const updatedCompletionStates = await Promise.all(
    _arg.libraryData.update.completionStates.map(async (status) =>
      _ctx.db.completionStatus.upsert({
        where: { playniteId_libraryId: { playniteId: status.id, libraryId } },
        create: {
          playniteId: status.id,
          name: status.name,
          Library: {
            connect: { id: libraryId },
          },
        },
        update: {
          name: status.name,
        },
      }),
    ),
  )

  logger.debug(
    `Persisting ${_arg.libraryData.update.releases.length} release assets for library ${libraryId}`,
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

  const persistedCovers = await Promise.all(
    _arg.libraryData.update.releases
      .filter((release) => {
        return [sources.some((s) => s.playniteId === release.source)].every(
          Boolean,
        )
      })
      .map(async (release) => {
        return _ctx.assets.persist(release)
      }),
  )

  const updatedReleases = await Promise.all(
    _arg.libraryData.update.releases
      .filter((release) => {
        return [sources.some((s) => s.playniteId === release.source)].every(
          Boolean,
        )
      })
      .map(async (release, i) => {
        const source = sources.find((s) => s.playniteId === release.source) as {
          id: number
          platformId: number
        }

        logger.silly(
          `Updating release ${release.id} for library ${libraryId}`,
          release,
        )
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
              playtime: BigInt(release.playtime ?? '0'),
              communityScore: release.communityScore,
              runState: runState.stopped,
              Library: {
                connect: { id: libraryId },
              },
              Cover: {
                create: {
                  type: 'cover',
                  ignId: persistedCovers[i] ? ignSlug(release) : null,
                },
              },
              hidden: release.hidden ?? false,
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
              ...(release?.completionStatus &&
                release.completionStatus !==
                  '00000000-0000-0000-0000-000000000000' && {
                  CompletionStatus: {
                    connect: {
                      playniteId_libraryId: {
                        playniteId: release.completionStatus,
                        libraryId,
                      },
                    },
                  },
                }),
              Tags: {
                connect: (release.tags ?? [])
                  .filter((t) => t !== null)
                  .map((t) => ({
                    playniteId_libraryId: { playniteId: t, libraryId },
                  })),
              },
            },
            update: {
              title: release.title,
              description: release.description,
              releaseDate: release.releaseDate,
              releaseYear: release.releaseDate?.getFullYear(),
              criticScore: release.criticScore,
              communityScore: release.communityScore,
              hidden: release.hidden ?? false,
              Cover: {
                update: {
                  type: 'cover',
                  ignId: persistedCovers[i] ? ignSlug(release) : null,
                },
              },
              ...(release.features && {
                Features: {
                  set: release.features
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
              }),
              Source: {
                connect: {
                  id: source.id,
                },
              },
              ...(release.completionStatus &&
                release.completionStatus !==
                  '00000000-0000-0000-0000-000000000000' && {
                  CompletionStatus: {
                    connect: {
                      playniteId_libraryId: {
                        playniteId: release.completionStatus,
                        libraryId,
                      },
                    },
                  },
                }),
              ...(release.tags && {
                Tags: {
                  set: release.tags
                    .filter((t) => t !== null)
                    .map((t) => ({
                      playniteId_libraryId: { playniteId: t, libraryId },
                    })),
                },
              }),
            },
          })
        } catch (error) {
          logger.error(
            `Error updating release ${release.id}, ${release.title} for library ${libraryId}`,
            error,
          )
        }
      }),
  )

  const games = groupBy(_arg.libraryData.update.releases, 'title')
  logger.info(
    `Updating library ${libraryId} with ${Object.keys(games).length} games`,
  )
  const updatedGames = await Promise.all(
    Object.entries(games).map(async ([title, releases]) => {
      return await _ctx.db.game.upsert({
        where: { title_libraryId: { title, libraryId } },
        create: {
          title,
          Library: {
            connect: { id: libraryId },
          },
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

  // Clean up games without releases
  logger.info(`Removing games without releases from library ${libraryId}`)
  const removedGames = await _ctx.db.game.deleteMany({
    where: {
      libraryId,
      Releases: { none: {} },
    },
  })
  logger.debug(
    `Removed ${removedGames.count} games without releases from library ${libraryId}`,
  )

  if (library.platformPriority.length === 0) {
    await _ctx.db.library.update({
      where: { id: libraryId },
      data: {
        platformPriority: platforms.map((p) => p.id),
      },
    })
    _ctx.subscriptionPublisher.publish('entityUpdated', {
      id: libraryId,
      type: domains.Library,
      fields: [
        {
          key: 'platformPriority',
          values: platforms.map((p) => create('Platform', p.id).toString()),
        },
      ],
      source: _arg.libraryData.source,
    })
  }

  logger.info(`Library ${libraryId} synced successfully`)

  _ctx.subscriptionPublisher.publish('librarySynced', {
    id: libraryId,
    type: domains.Library,
    source: _arg.libraryData.source,
  })

  return library
}
