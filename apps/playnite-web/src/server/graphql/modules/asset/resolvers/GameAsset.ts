import { Release } from 'apps/playnite-web/src/server/data/types.entities'
import type { GameAssetResolvers } from '../../../../../../.generated/types.generated.js'
export const GameAsset: GameAssetResolvers = {
  id: (_parent) => _parent.id,
  type: (_parent) => _parent.relatedType,
  release: async (parent, arg, ctx) => {
    return ctx.queryApi.execute({
      entityType: 'Release',
      type: 'ExactMatch',
      field: 'id',
      value: parent.relatedId,
    }) as unknown as Promise<Release>
  },
}
