import { tryParseOid } from '../../../../../oid'
import type { QueryResolvers } from './../../../../../../../.generated/types.generated'
export const source: NonNullable<QueryResolvers['source']> = async (
  _parent,
  _arg,
  _ctx,
) => {
  const oid = tryParseOid(_arg.id)

  return _ctx.db.source.findUnique({
    where: {
      id: oid.id,
    },
  })
}
