import type { CompletionStatusResolvers } from '../../../../../../.generated/types.generated.js'
import { create } from '../../../../oid.js'

export const CompletionStatus: CompletionStatusResolvers = {
  id: async (_parent, _arg, _ctx) => {
    return create('CompletionStatus', _parent.id).toString()
  },
  releases: async (_parent, _arg, _ctx) => {
    return _ctx.db.release.findMany({
      where: {
        CompletionStatus: {
          id: _parent.id,
        },
      },
      orderBy: {
        title: 'asc',
      },
    })
  },
}
