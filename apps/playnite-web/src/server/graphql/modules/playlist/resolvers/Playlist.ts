import _ from 'lodash'
import type { PlaylistResolvers } from '../../../../../../.generated/types.generated'
import { create } from '../../../../oid'

const { startCase, lowerCase } = _

export const Playlist: PlaylistResolvers = {
  id: async (_parent, _arg, _ctx) => {
    return create('Playlist', _parent.id).toString()
  },
  name: async (_parent, _arg, _ctx) => {
    return startCase(lowerCase(_parent.name))
  },
  games: async (_parent, _arg, _ctx) => {
    return _parent.games
  },
}
