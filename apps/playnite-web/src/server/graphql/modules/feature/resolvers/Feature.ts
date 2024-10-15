import { Release } from 'apps/playnite-web/src/server/data/types.entities'
import type { FeatureResolvers } from '../../../../../../.generated/types.generated'
import { create } from '../../../../oid'

export const Feature: FeatureResolvers = {
  id: async (_parent, _arg, _ctx) => {
    return create('Feature', _parent.id).toString()
  },
  releases: async (_parent, _arg, _ctx) => {
    const results = await _ctx.queryApi.execute<Release>({
      entityType: 'Release',
      type: 'ExactMatch',
      field: 'featureIds',
      value: [_parent.id],
    })

    return results ?? []
  },
}
