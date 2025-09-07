import type { TagResolvers } from '../../../../../../.generated/types.generated.js'
import { create } from '../../../../oid.js'

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
        PrimaryRelease: {
          title: 'asc',
        },
      },
    })
    return games
  },
}
