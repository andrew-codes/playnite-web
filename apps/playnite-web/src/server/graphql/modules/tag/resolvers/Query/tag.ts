import { tryParseOid } from '../../../../../oid'
import type { QueryResolvers } from './../../../../../../../.generated/types.generated'

export const tag: NonNullable<QueryResolvers['tag']> = async (
  _parent,
  _arg,
  _ctx,
) => {
  const oid = tryParseOid(_arg.id)

  return _ctx.db.tag.findUnique({
    where: {
      id: oid.id,
    },
  })
}
