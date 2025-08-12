import { Release } from '@prisma/client.js'
import { GraphQLError } from 'graphql'
import type { GameResolvers } from '../../../../../../.generated/types.generated.js'
import { create, domains } from '../../../../oid.js'

export const Game: GameResolvers = {
  id: async (_parent, _arg, _ctx) => {
    return create('Game', _parent.id).toString()
  },
  releases: async (_parent, _arg, _ctx) => {
    return _ctx.db.release.findMany({
      where: {
        Games: {
          some: {
            id: _parent.id,
          },
        },
      },
      orderBy: {
        title: 'asc',
      },
    })
  },
  primaryRelease: async (_parent, _arg, _ctx) => {
    const library = await _ctx.db.library.findUnique({
      where: {
        id: _parent.libraryId,
      },
    })

    if (!library) {
      throw new GraphQLError('Library not found', {
        extensions: {
          code: 'NOT_FOUND',
          entity: create('Library', _parent.libraryId).toString(),
        },
      })
    }

    const releases = await _ctx.db.release.findMany({
      where: {
        Games: {
          some: {
            id: _parent.id,
          },
        },
      },
      include: {
        Source: {
          include: {
            Platform: true,
          },
        },
      },
    })

    let primaryRelease: undefined | null | Release = null
    for (const platformId of library.platformPriority) {
      primaryRelease = releases?.find(
        (r) => r.Source.Platform.id === platformId,
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
}
