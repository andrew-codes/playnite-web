import type { CompletionStatusResolvers } from '../../../../../../.generated/types.generated'
import { create, createNull } from '../../../../oid'

export const CompletionStatus: CompletionStatusResolvers = {
  id: async (_parent, _arg, _ctx) => {
    if (_parent.id === '00000000-0000-0000-0000-000000000000') {
      return createNull('CompletionStatus').toString()
    }
    return create('CompletionStatus', _parent.id).toString()
  },
  releases: async (_parent, _arg, _ctx) => {
    if (_parent.id === '00000000-0000-0000-0000-000000000000') {
      return []
    }
    return _ctx.api.gameRelease.getBy({ completionStatusId: _parent.id })
  },
}
