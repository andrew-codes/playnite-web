import type { SeriesResolvers } from '../../../../../../.generated/types.generated'
import { create } from '../../../../oid'

export const Series: SeriesResolvers = {
  id: async (_parent, _arg, _ctx) => {
    return create('Series', _parent.id).toString()
  },
  games: async (parent, _args, ctx) => {
    const games = await ctx.db.game.findMany({
      where: {
        Releases: {
          some: {
            Series: {
              some: {
                id: parent.id,
              },
            },
          },
        },
      },
      orderBy: {
        title: 'asc',
      },
    })
    return games
  },
}
