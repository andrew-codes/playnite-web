import type { GameAssetResolvers } from '../../../../../../.generated/types.generated'
export const GameAsset: GameAssetResolvers = {
  id: (parent) => parent.id,
  type: (parent) => parent.relatedType,
  release: async (parent, arg, ctx) => {
    return ctx.api.gameRelease.getById(parent.relatedId)
  },
}
