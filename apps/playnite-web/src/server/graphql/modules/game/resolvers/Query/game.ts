import type { QueryResolvers } from '../../../../../../../.generated/types.generated'
import { unknownPlatform } from '../../../platform/api'

export const game: NonNullable<QueryResolvers['game']> = async (
  _parent,
  _arg,
  _ctx,
) => {
  return (await _ctx.api.game.getById(_arg.id)).filter(
    (release) => release.platformSource.id !== unknownPlatform.id,
  )
}
