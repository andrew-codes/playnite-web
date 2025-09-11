import { GraphQLError } from 'graphql'
import { create, domains } from '../../../../oid.js'
import { GraphCompletionStatus } from '../../../resolverTypes'
import type { ReleaseResolvers } from './../../../../../../.generated/types.generated'

export const Release: ReleaseResolvers = {
  id: async (_parent, _arg, _ctx) => {
    return create('Release', _parent.id).toString()
  },
  description: async (_parent, _arg, _ctx) => {
    return _parent.description
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
      select: {
        url: true,
      },
    })

    if (!asset?.url) {
      return null
    }

    return url
    // return `/public/game-assets/${asset.ignId}.webp`
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
        Sources: {
          some: {
            id: _parent.sourceId,
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
  tags: async (_parent, _arg, _ctx) => {
    return _ctx.db.tag.findMany({
      where: {
        Releases: {
          some: {
            id: _parent.id,
          },
        },
      },
    })
  },
}
