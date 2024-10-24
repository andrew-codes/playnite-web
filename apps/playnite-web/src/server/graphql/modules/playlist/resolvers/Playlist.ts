import _ from 'lodash'
import type { PlaylistResolvers } from '../../../../../../.generated/types.generated'
import { Game } from '../../../../data/types.entities'
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
    const results = await Promise.all(
      _parent.gameIds.map((id) =>
        _ctx.queryApi.execute<Game>({
          entityType: 'Game',
          type: 'ExactMatch',
          field: 'id',
          value: id,
        }),
      ),
    )

    return results
      .filter((result) => result !== null)
      .map((result) => result[0])
  },
}
