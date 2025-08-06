import { GraphQLError } from 'graphql'
import { Release } from '../../../../../../.generated/prisma/client.js'
import type { GameResolvers } from '../../../../../../.generated/types.generated.js'
import { create, domains } from '../../../../oid.js'
import { GraphCompletionStatus } from '../../../resolverTypes.js'

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
    })

    let primaryRelease: undefined | null | Release = null
    for (const platformId of library.platformPriority) {
      primaryRelease = releases?.find((r) => r.platformId === platformId)
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
  completionStatus: async (_parent, _arg, _ctx) => {
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
        libraryId: _parent.libraryId,
        platformId: {
          in: library.platformPriority,
        },
      },
    })

    let primaryRelease: undefined | null | Release = null
    for (const platformId of library.platformPriority) {
      primaryRelease = releases?.find((r) => r.platformId === platformId)
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

    let output: null | GraphCompletionStatus = null
    if (primaryRelease?.completionStatusId) {
      output = await _ctx.db.completionStatus.findUnique({
        where: {
          id: primaryRelease.completionStatusId,
        },
      })
    }
    if (!output && library.defaultCompletionStatusId) {
      output = await _ctx.db.completionStatus.findFirst({
        where: {
          id: library.defaultCompletionStatusId,
        },
      })
    }

    if (!output) {
      output = await _ctx.db.completionStatus.findFirst({
        where: {
          libraryId: _parent.libraryId,
        },
      })
    }

    if (!output) {
      throw new GraphQLError('No completion status found for game', {
        extensions: {
          code: 'NOT_FOUND',
          entity: create('Asset', _parent.id).toString(),
          type: domains.CompletionStatus,
          library: create('Library', _parent.libraryId).toString(),
        },
      })
    }

    return output
  },
  platforms: async (_parent, _arg, _ctx) => {
    return _ctx.db.platform.findMany({
      where: {
        Releases: {
          some: {
            id: _parent.releaseId,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })
  },
}
