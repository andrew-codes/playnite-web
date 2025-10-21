import { GraphQLError } from 'graphql'
import type { GameResolvers } from '../../../../../../.generated/types.generated'
import { Release } from '../../../../data/providers/postgres/client'
import { create, domains } from '../../../../oid'

export const Game: GameResolvers = {
  id: async (_parent, _arg, _ctx) => {
    return create('Game', _parent.id).toString()
  },
  releases: async (_parent, _arg, _ctx) => {
    const releases = await _ctx.loaders.releasesByGameLoader.load(Number(_parent.id))
    return releases.sort((a, b) => a.title.localeCompare(b.title))
  },
  primaryRelease: async (_parent, _arg, _ctx) => {
    const library = await _ctx.loaders.libraryLoader.load(Number(_parent.libraryId))

    if (!library) {
      throw new GraphQLError('Library not found', {
        extensions: {
          code: 'NOT_FOUND',
          entity: create('Library', _parent.libraryId).toString(),
        },
      })
    }

    const releases = await _ctx.loaders.releasesByGameLoader.load(Number(_parent.id))

    // Load sources and platforms for all releases in parallel
    const sourcesPromises = releases.map((r) =>
      _ctx.loaders.sourceLoader.load(Number(r.sourceId)),
    )
    const sources = await Promise.all(sourcesPromises)

    const platformsPromises = sources.map((s) =>
      s ? _ctx.loaders.platformLoader.load(Number(s.platformId)) : null,
    )
    const platforms = await Promise.all(platformsPromises)

    // Create a map of release to platform
    const releasePlatformMap = new Map()
    releases.forEach((release, index) => {
      releasePlatformMap.set(release.id, platforms[index])
    })

    let primaryRelease: undefined | null | Release = null
    for (const platformId of library.platformPriority) {
      primaryRelease = releases?.find(
        (r) => releasePlatformMap.get(r.id)?.id === platformId,
      )
      if (primaryRelease) {
        break
      }
    }

    if (!primaryRelease) {
      throw new GraphQLError('No primary release found for game', {
        extensions: {
          code: 'NOT_FOUND',
          entity: create('Game', _parent.id).toString(),
          type: domains.Release,
          library: create('Library', _parent.libraryId).toString(),
        },
      })
    }

    return primaryRelease
  },

  library: async (_parent, _arg, _ctx) => {
    const library = await _ctx.loaders.libraryLoader.load(Number(_parent.libraryId))
    if (!library) {
      throw new GraphQLError('Library not found', {
        extensions: {
          code: 'NOT_FOUND',
          entity: create('Library', _parent.libraryId).toString(),
        },
      })
    }
    return library
  },
}
