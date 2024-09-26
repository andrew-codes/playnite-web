import { GameReleaseEntity } from '../../../../resolverTypes'
import type { QueryResolvers } from './../../../../../../../.generated/types.generated'
export const nowPlaying: NonNullable<QueryResolvers['nowPlaying']> = async (
  _parent,
  _arg,
  _ctx,
) => {
  return (
    ((await _ctx.api.game.getBy({ 'releases.active': true }))?.[0]
      ?.releases?.[0] as GameReleaseEntity) ?? null
  )
}
