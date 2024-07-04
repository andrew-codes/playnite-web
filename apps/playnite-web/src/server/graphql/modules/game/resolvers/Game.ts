import { create } from '../../../../oid'
import type { GameResolvers } from './../../../types.generated'

export const Game: GameResolvers = {
  id: async (_parent, _arg, _ctx) => {
    return create('Game', _parent.map(({ id }) => id).join(',')).toString()
  },
  name: async (_parent, _arg, _ctx) => {
    return _parent[0].name
  },
  description: async (_parent, _arg, _ctx) => {
    return _parent[0].description
  },
  releases: async (_parent, _arg, _ctx) => {
    return _parent
  },
}
