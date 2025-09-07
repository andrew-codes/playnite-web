import { fromString } from '../../../../../oid.js'
import type { QueryResolvers } from './../../../../../../../.generated/types.generated'
export const sources: NonNullable<QueryResolvers['sources']> = async (
  _parent,
  _arg,
  _ctx,
) => {
  return _ctx.db.source.findMany({
    where: {
      Library: {
        id: fromString(_arg.libraryId).id,
      },
    },
    orderBy: {
      name: 'asc',
    },
  })
}
