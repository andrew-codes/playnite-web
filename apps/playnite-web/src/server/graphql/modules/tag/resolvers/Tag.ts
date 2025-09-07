import type { TagResolvers } from '../../../../../../.generated/types.generated'
import { create } from '../../../../oid'

export const Tag: TagResolvers = {
  id: (parent) => create('Tag', parent.id).toString(),
  games: async (parent, _args, ctx) => {
    const games = await ctx.db.game.findMany({
      where: {
        Releases: {
          some: {
            Tags: {
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
