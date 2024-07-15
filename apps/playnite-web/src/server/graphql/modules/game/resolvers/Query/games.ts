import type { QueryResolvers } from './../../../../types.generated'

export const games: NonNullable<QueryResolvers['games']> = async (
  _parent,
  _arg,
  _ctx,
) => {
  return _ctx.api.game.getAll()
}
