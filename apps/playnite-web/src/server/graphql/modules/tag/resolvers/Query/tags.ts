import { fromString } from '../../../../../oid.js'
import type { QueryResolvers } from './../../../../../../../.generated/types.generated'

export const tags: NonNullable<QueryResolvers['tags']> = async (
  _parent,
  _arg,
  _ctx,
) => {
  return _ctx.db.tag.findMany({
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
