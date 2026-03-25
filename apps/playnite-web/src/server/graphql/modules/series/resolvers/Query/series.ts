import { tryParseOid } from '../../../../../oid'
import type { QueryResolvers } from './../../../../../../../.generated/types.generated'

export const series: NonNullable<QueryResolvers['series']> = async (
  _parent,
  _arg,
  _ctx,
) => {
  const oid = tryParseOid(_arg.id)

  return _ctx.db.series.findUnique({
    where: {
      id: oid.id,
    },
  })
}
