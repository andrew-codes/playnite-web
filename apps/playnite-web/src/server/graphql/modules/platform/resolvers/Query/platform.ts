import { tryParseOid } from '../../../../../oid'
import type { QueryResolvers } from './../../../../../../../.generated/types.generated'

export const platform: NonNullable<QueryResolvers['platform']> = async (
  _parent,
  _arg,
  _ctx,
) => {
  const oid = tryParseOid(_arg.id)

  return _ctx.db.platform.findUnique({
    where: {
      id: oid.id,
    },
  })
}
