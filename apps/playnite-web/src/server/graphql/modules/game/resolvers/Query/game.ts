import type { QueryResolvers } from './../../../../types.generated'

export const game: NonNullable<QueryResolvers['game']> = async (
  _parent,
  _arg,
  _ctx,
) => {
  return _ctx.api.game.getById(_arg.id)
}
