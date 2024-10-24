import type { QueryResolvers } from '../../../../../../../.generated/types.generated'
import { Game } from '../../../../../data/types.entities'
import { fromString } from '../../../../../oid'

export const game: NonNullable<QueryResolvers['game']> = async (
  _parent,
  _arg,
  _ctx,
) => {
  const result = await _ctx.queryApi.execute<Game>({
    entityType: 'Game',
    type: 'ExactMatch',
    field: 'id',
    value: fromString(_arg.id).id,
  })

  return result?.[0] ?? null
}
