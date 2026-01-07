import { GraphQLError } from 'graphql'
import { create, domains } from '../../../../oid'
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
      output = await _ctx.loaders.completionStatusLoader.load(
        Number(_parent.completionStatusId),
      )
    }

    return output
  },
  features: async (_parent, _arg, _ctx) => {
    return _ctx.loaders.releaseFeatureLoader.load(Number(_parent.id))
  },
  game: async (_parent, _arg, _ctx) => {
    const output = await _ctx.loaders.gameLoader.load(
      Number(_parent.releaseGameId),
    )

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
    const output = await _ctx.loaders.platformBySourceLoader.load(
      Number(_parent.sourceId),
    )
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
    const output = await _ctx.loaders.sourceLoader.load(
      Number(_parent.sourceId),
    )
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
    return _ctx.loaders.releaseTagLoader.load(Number(_parent.id))
  },
  recentActivity: async (_parent, _arg, _ctx) => {
    return _parent.recentActivity
  },
}
