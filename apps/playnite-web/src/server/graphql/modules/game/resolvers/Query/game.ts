import _ from 'lodash'
import type { QueryResolvers } from '../../../../../../../.generated/types.generated'
import { fromString } from '../../../../../oid'

const { merge } = _

export const game: NonNullable<QueryResolvers['game']> = async (
  _parent,
  _arg,
  _ctx,
) => {
  return _ctx.api.game.getById(fromString(_arg.id).id)
}
