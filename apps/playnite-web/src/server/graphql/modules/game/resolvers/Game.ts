import { GraphQLError } from 'graphql'
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
  completionStatus: async (_parent, _arg, _ctx) => {
    const primaryRelease = await _ctx.db.release.findFirst({
      where: {
        PrimaryGame: {
          id: _parent.id,
        },
      },
    })

    let output: null | GraphCompletionStatus = null
    if (primaryRelease?.completionStatusId) {
      output = await _ctx.db.completionStatus.findUnique({
        where: {
          id: primaryRelease.completionStatusId,
        },
      })
    }
    if (!output) {
      const defaultCompletionStatus = await _ctx.db.defaults.findFirst({
        where: {
          libraryId: _parent.libraryId,
        },
      })

      if (defaultCompletionStatus?.completionStatusId) {
        output = await _ctx.db.completionStatus.findUnique({
          where: {
            id: defaultCompletionStatus.completionStatusId,
          },
        })
      }
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
