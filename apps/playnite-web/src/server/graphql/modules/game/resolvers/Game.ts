import type { GameResolvers } from '../../../../../../.generated/types.generated'
import { create } from '../../../../oid'

export const Game: GameResolvers = {
  id: async (_parent, _arg, _ctx) => {
    return create('Game', _parent.id).toString()
  },
  name: async (_parent, _arg, _ctx) => {
    return _parent.name
  },
  description: async (_parent, _arg, _ctx) => {
    return _parent.description
  },
  releases: async (_parent, _arg, _ctx) => {
    return _parent.releases
  },
  cover: async (_parent, _arg, _ctx) => {
    return _parent.releases[0]
      ? ((await _ctx.api.asset.getByRelation(
          _parent.releases[0].id,
          'cover',
        )) ?? null)
      : null
  },
}
