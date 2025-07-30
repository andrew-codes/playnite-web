import { GraphQLError } from 'graphql'
import { groupBy } from 'lodash-es'
import type { MutationResolvers } from './../../../../../../../.generated/types.generated'

export const syncLibrary: NonNullable<
  MutationResolvers['syncLibrary']
> = async (_parent, _arg, _ctx) => {
  const library = await _ctx.db.library.findFirst({
    where: {
      playniteId: _arg.libraryData.libraryId,
      userId: _ctx.jwt?.payload.id,
    },
    select: {
      id: true,
    },
  })

  if (!library) {
    throw new GraphQLError('Library not found', {
      extensions: {
        code: 'NOT_FOUND',
        argumentName: 'libraryData.libraryId',
        id: _arg.libraryData.libraryId,
      },
    })
  }
  const libraryId = library.id

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

  //  Sources
  await _ctx.db.source.deleteMany({
    where: {
      libraryId,
      playniteId: {
        in: _arg.libraryData.remove.sources,
      },
    },
  })

  // Platforms
  await _ctx.db.platform.deleteMany({
    where: {
      libraryId,
      playniteId: {
        in: _arg.libraryData.remove.platforms,
      },
    },
  })

  // Tags
  await _ctx.db.tag.deleteMany({
    where: {
      libraryId,
      playniteId: {
        in: _arg.libraryData.remove.tags,
      },
    },
  })

  // CompletionStates
  await _ctx.db.completionStatus.deleteMany({
    where: {
      libraryId,
      playniteId: {
        in: _arg.libraryData.remove.completionStates,
      },
    },
  })

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
  const gamesWithNoReleases = await _ctx.db.game.findMany({
    where: {
      libraryId,
      Releases: { none: {} },
    },
    select: {
      id: true,
    },
  })
  await _ctx.db.game.deleteMany({
    where: {
      id: { in: gamesWithNoReleases.map((g) => g.id) },
    },
  })

  // Updates
  // Features
  await Promise.all(
    _arg.libraryData.update.features.map(async (feature) => {
      _ctx.db.feature.upsert({
        where: { playniteId_libraryId: { playniteId: feature.id, libraryId } },
        create: {
          playniteId: feature.id,
          name: feature.name,
          libraryId,
        },
        update: {
          name: feature.name,
        },
      })
    }),
  )

  // Platforms
  await Promise.all(
    _arg.libraryData.update.platforms.map(async (platform) => {
      _ctx.db.platform.upsert({
        where: { playniteId_libraryId: { playniteId: platform.id, libraryId } },
        create: {
          playniteId: platform.id,
          name: platform.name,
          libraryId,
        },
        update: {
          name: platform.name,
        },
      })
    }),
  )

  // Sources
  const platforms = await _ctx.db.platform.findMany({
    where: { libraryId },
    select: { id: true, playniteId: true },
  })
  await Promise.all(
    _arg.libraryData.update.sources
      .filter((source) => {
        return platforms.some((p) => p.playniteId === source.platform)
      })
      .map(async (source) => {
        _ctx.db.source.upsert({
          where: { playniteId_libraryId: { playniteId: source.id, libraryId } },
          create: {
            playniteId: source.id,
            name: source.name,
            libraryId,
            platformId: (
              platforms.find((p) => p.playniteId === source.platform) as {
                id: number
              }
            ).id,
          },
          update: {
            name: source.name,
          },
        })
      }),
  )

  // Tags
  await Promise.all(
    _arg.libraryData.update.tags.map(async (tag) => {
      _ctx.db.tag.upsert({
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

  // CompletionStates
  await Promise.all(
    _arg.libraryData.update.completionStates.map(async (status) => {
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
      })
    }),
  )

  // Releases
  const sources = await _ctx.db.source.findMany({
    where: { libraryId },
    select: { id: true, playniteId: true },
  })
  const features = await _ctx.db.feature.findMany({
    where: { libraryId },
    select: { id: true, playniteId: true },
  })
  const completionStates = await _ctx.db.completionStatus.findMany({
    where: { libraryId },
    select: { id: true, playniteId: true },
  })
  const tags = await _ctx.db.tag.findMany({
    where: { libraryId },
    select: { id: true, playniteId: true },
  })
  await Promise.all(
    _arg.libraryData.update.releases
      .filter((release) => {
        return [
          platforms.some((p) => p.playniteId === release.platform),
          sources.some((s) => s.playniteId === release.source),
          features.every(
            (f) =>
              f.playniteId !== null && release.features.includes(f.playniteId),
          ),
          completionStates.some(
            (cs) => cs.playniteId === release.completionStatus,
          ),
          tags.every(
            (t) => t.playniteId !== null && release.tags.includes(t.playniteId),
          ),
        ].every(Boolean)
      })
      .map(async (release) => {
        _ctx.db.release.upsert({
          where: {
            playniteId_libraryId: { playniteId: release.id, libraryId },
          },
          create: {
            playniteId: release.id,
            title: release.title,
            libraryId,
            description: release.description,
            releaseDate: release.releaseDate,
            releaseYear: release.releaseDate.getFullYear(),
            criticScore: release.criticScore,
            communityScore: release.communityScore,
            hidden: release.hidden,
            platformId: (
              platforms.find((p) => p.playniteId === release.platform) as {
                id: number
              }
            ).id,
            sourceId: (
              sources.find((s) => s.playniteId === release.source) as {
                id: number
              }
            ).id,
            Features: {
              connect: (release.features ?? [])
                .filter((f) => f !== null)
                .map((f) => {
                  return features.find((f2) => f2.playniteId === f) as {
                    id: number
                  }
                }),
            },
            completionStatusId: (
              completionStates.find(
                (cs) => cs.playniteId === release.completionStatus,
              ) as {
                id: number
              }
            ).id,
            Tags: {
              connect: (release.tags ?? [])
                .filter((t) => t !== null)
                .map((t) => {
                  return tags.find((t2) => t2.playniteId === t) as {
                    id: number
                  }
                }),
            },
          },
          update: {
            title: release.title,
            description: release.description,
            releaseDate: release.releaseDate,
            releaseYear: release.releaseDate.getFullYear(),
            criticScore: release.criticScore,
            communityScore: release.communityScore,
            hidden: release.hidden,
            Features: {
              set: (release.features ?? [])
                .filter((f) => f !== null)
                .map((f) => {
                  return features.find((f2) => f2.playniteId === f) as {
                    id: number
                  }
                }),
            },
            completionStatusId: (
              completionStates.find(
                (cs) => cs.playniteId === release.completionStatus,
              ) as {
                id: number
              }
            ).id,
            Tags: {
              set: (release.tags ?? [])
                .filter((t) => t !== null)
                .map((t) => {
                  return tags.find((t2) => t2.playniteId === t) as {
                    id: number
                  }
                }),
            },
          },
        })
      }),
  )

  const games = groupBy(_arg.libraryData.update.releases, 'title')
  await Promise.all(
    Object.entries(games).map(async ([title, releases]) => {
      const game = await _ctx.db.game.upsert({
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

  return _ctx.db.library.findFirst({
    where: { id: libraryId },
  })
}
