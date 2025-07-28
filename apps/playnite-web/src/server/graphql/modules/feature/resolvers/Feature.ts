import type { FeatureResolvers } from '../../../../../../.generated/types.generated.js'
import { create } from '../../../../oid.js'

export const Feature: FeatureResolvers = {
  id: async (_parent, _arg, _ctx) => {
    return create('Feature', _parent.id).toString()
  },
  games: async (parent, _args, ctx) => {
    const games = await ctx.db.game.findMany({
      where: {
        Releases: {
          some: {
            Features: {
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
