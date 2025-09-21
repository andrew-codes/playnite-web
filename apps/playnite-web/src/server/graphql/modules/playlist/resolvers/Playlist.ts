import type { PlaylistResolvers } from '../../../../../../.generated/types.generated.js'
import { create } from '../../../../oid.js'

export const Playlist: PlaylistResolvers = {
  id: async (_parent, _arg, _ctx) => {
    return create('Playlist', _parent.id).toString()
  },
  name: async (_parent, _arg, _ctx) => {
    return _parent.name
  },
  games: async (_parent, _arg, _ctx) => {
    return _ctx.db.game.findMany({
      where: {
        Playlists: {
          some: {
            id: _parent.id,
          },
        },
      },
    })
  },
}
