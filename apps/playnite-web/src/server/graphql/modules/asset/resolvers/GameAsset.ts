import { create } from '../../../../oid'
import type { GameAssetResolvers } from './../../../types.generated'
export const GameAsset: GameAssetResolvers = {
  id: (parent) => create('GameAsset', parent.id).toString(),
  type: (parent) => parent.relatedType,
  release: async (parent, arg, ctx) => {
    return ctx.api.gameRelease.getById(parent.relatedId)
  },
}
