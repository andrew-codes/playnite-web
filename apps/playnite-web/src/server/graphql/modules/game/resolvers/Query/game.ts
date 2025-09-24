import type { QueryResolvers } from '../../../../../../../.generated/types.generated'
import { tryParseOid } from '../../../../../oid'

export const game: NonNullable<QueryResolvers['game']> = async (
  _parent,
  _arg,
  _ctx,
) => {
  const oid = tryParseOid(_arg.id)

  return _ctx.db.game.findUnique({
    where: {
      id: oid.id,
    },
  })
}
