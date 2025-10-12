import { tryParseOid } from '../../../../../oid'
import type { QueryResolvers } from './../../../../../../../.generated/types.generated'

export const feature: NonNullable<QueryResolvers['feature']> = async (
  _parent,
  _arg,
  _ctx,
) => {
  const oid = tryParseOid(_arg.id)

  return _ctx.db.feature.findUnique({
    where: {
      id: oid.id,
    },
  })
}
