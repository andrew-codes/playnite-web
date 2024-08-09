import type { FeatureResolvers } from '../../../../../../.generated/types.generated'
import { create } from '../../../../oid'

export const Feature: FeatureResolvers = {
  id: async (_parent, _arg, _ctx) => {
    return create('Feature', _parent.id).toString()
  },
  releases: async (_parent, _arg, _ctx) => {
    return _ctx.api.gameRelease.getBy({ featureIds: _parent.id })
  },
}
