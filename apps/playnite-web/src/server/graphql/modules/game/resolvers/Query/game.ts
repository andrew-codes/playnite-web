import { fromString } from '../../../../../oid'
import type { QueryResolvers } from './../../../../types.generated'

export const game: NonNullable<QueryResolvers['game']> = async (
  _parent,
  _arg,
  _ctx,
) => {
  const gameReleaseIds = fromString(_arg.id).id.split(',')
  const gameReleases = await Promise.all(
    gameReleaseIds.map((id) => _ctx.api.gameRelease.getById(id)),
  )
  return gameReleases
}
