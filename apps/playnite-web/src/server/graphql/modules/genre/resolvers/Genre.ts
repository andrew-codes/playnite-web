import type { GenreResolvers } from '../../../../../../.generated/types.generated'
import { create } from '../../../../oid'

export const Genre: GenreResolvers = {
  id: async (_parent, _arg, _ctx) => {
    return create('Genre', _parent.id).toString()
  },
  games: async (parent, _args, ctx) => {
    const games = await ctx.db.game.findMany({
      where: {
        Releases: {
          some: {
            Genres: {
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
