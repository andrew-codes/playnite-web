import { create } from '../../../../oid'
import type { PlatformResolvers } from './../../../types.generated'

export const Platform: PlatformResolvers = {
  id: async (_parent, _arg, _ctx) => {
    return create('Platform', _parent.id).toString()
  },
  name: async (_parent, _arg, _ctx) => {
    return _parent.name
  },
  releases: async (_parent, _arg, _ctx) => {
    return _ctx.api.gameRelease.getBy({ platformIds: _parent.id })
  },
}
