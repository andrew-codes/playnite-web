import type { QueryResolvers } from '../../../../../../../.generated/types.generated'
import { fromString } from '../../../../../oid'

export const game: NonNullable<QueryResolvers['game']> = async (
  _parent,
  _arg,
  _ctx,
) => {
  return await _ctx.api.game.getById(fromString(_arg.id).id)
}
