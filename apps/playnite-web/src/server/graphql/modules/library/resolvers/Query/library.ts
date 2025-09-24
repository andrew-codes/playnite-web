import type { QueryResolvers } from '../../../../../../../.generated/types.generated'
import { tryParseOid } from '../../../../../oid'

export const library: NonNullable<QueryResolvers['library']> = async (
  _parent,
  _arg,
  _ctx,
) => {
  const libraryId = tryParseOid(_arg.libraryId)

  return _ctx.db.library.findFirst({
    where: {
      id: libraryId.id,
    },
  })
}
