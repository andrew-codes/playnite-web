import { Release } from 'apps/playnite-web/src/server/data/types.entities'
import type { CompletionStatusResolvers } from '../../../../../../.generated/types.generated.js'
import { create } from '../../../../oid.js'

export const CompletionStatus: CompletionStatusResolvers = {
  id: async (_parent, _arg, _ctx) => {
    return create('CompletionStatus', _parent.id).toString()
  },
  releases: async (_parent, _arg, _ctx) => {
    const results = await _ctx.queryApi.execute<Release>({
      entityType: 'Release',
      type: 'ExactMatch',
      field: 'completionStatusId',
      value: _parent.id,
    })

    return results ?? []
  },
}
