import _ from 'lodash'
import { create } from '../../../../oid'
import type { PlaylistResolvers } from './../../../types.generated'

const { startCase, lowerCase } = _

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
    const allGames = await _ctx.api.game.getAll()
    return allGames.filter((game) => {
      return game.some((release) => {
        return release.tags?.some((tag) => {
          return tag.name === _parent.name
        })
      })
    })
  },
}
