import { GraphQLError } from 'graphql'
import { create, domains } from '../../../../oid.js'
import { GraphCompletionStatus } from '../../../resolverTypes'
import type { ReleaseResolvers } from './../../../../../../.generated/types.generated'

export const Release: ReleaseResolvers = {
  id: async (_parent, _arg, _ctx) => {
    return create('Game', _parent.id).toString()
  },
  completionStatus: async (_parent, _arg, _ctx) => {
    let output: null | GraphCompletionStatus = null
    if (_parent.completionStatusId) {
      output = await _ctx.db.completionStatus.findUnique({
        where: {
          id: _parent.completionStatusId,
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
      throw new GraphQLError('Completion status not found', {
        extensions: {
          code: 'NOT_FOUND',
          entity: create('Release', _parent.id).toString(),
          type: domains.CompletionStatus,
          library: create('Library', _parent.libraryId).toString(),
        },
      })
    }

    return output
  },

  cover: async (_parent, _arg, _ctx) => {
    if (!_parent.coverId) {
      return null
    }

    const asset = await _ctx.db.asset.findUnique({
      where: {
        id: _parent.coverId,
      },
    })

    return asset ?? null
  },
  features: async (_parent, _arg, _ctx) => {
    return _ctx.db.feature.findMany({
      where: {
        Releases: {
          some: {
            id: _parent.id,
          },
        },
      },
    })
  },
  game: async (_parent, _arg, _ctx) => {
    const output = await _ctx.db.game.findFirst({
      where: {
        Releases: {
          some: {
            id: _parent.id,
          },
        },
      },
    })

    if (!output) {
      throw new GraphQLError('Game not found', {
        extensions: {
          code: 'NOT_FOUND',
          entity: create('Release', _parent.id).toString(),
          type: domains.Game,
          library: create('Library', _parent.libraryId).toString(),
        },
      })
    }

    return output
  },
  platform: async (_parent, _arg, _ctx) => {
    const output = await _ctx.db.platform.findFirst({
      where: {
        Releases: {
          some: {
            id: _parent.id,
          },
        },
      },
    })
    if (!output) {
      throw new GraphQLError('Platform not found', {
        extensions: {
          code: 'NOT_FOUND',
          entity: create('Release', _parent.id).toString(),
          type: domains.Platform,
          library: create('Library', _parent.libraryId).toString(),
        },
      })
    }

    return output
  },
  source: async (_parent, _arg, _ctx) => {
    const output = await _ctx.db.source.findFirst({
      where: {
        Releases: {
          some: {
            id: _parent.id,
          },
        },
      },
    })
    if (!output) {
      throw new GraphQLError('Source not found', {
        extensions: {
          code: 'NOT_FOUND',
          entity: create('Release', _parent.id).toString(),
          type: domains.Source,
          library: create('Library', _parent.libraryId).toString(),
        },
      })
    }

    return output
  },
}
