import { lowerCase, startCase } from 'lodash'
import { create } from '../../../../oid'
import type { PlaylistResolvers } from './../../../types.generated'

export const Playlist: PlaylistResolvers = {
  id: async (_parent, _arg, _ctx) => {
    return create('Playlist', _parent.id).toString()
  },
  name: async (_parent, _arg, _ctx) => {
    return startCase(
      lowerCase(_parent.name.replace('playlist-', '').replaceAll('-', ' ')),
    )
  },
  games: async (_parent, _arg, _ctx) => {
    return []
  },
}
