import { create } from '../../../../oid'
import type { CompletionStatusResolvers } from './../../../types.generated'

export const CompletionStatus: CompletionStatusResolvers = {
  id: async (_parent, _arg, _ctx) => {
    return create('CompletionStatus', _parent.id).toString()
  },
  gameReleases: async (_parent, _arg, _ctx) => {
    return _ctx.api.gameRelease.getBy({ completionStatusId: _parent.id })
  },
}
