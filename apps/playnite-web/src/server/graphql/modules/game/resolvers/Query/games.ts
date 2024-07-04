import _ from 'lodash'
import type { QueryResolvers } from './../../../../types.generated'

const { groupBy } = _
export const games: NonNullable<QueryResolvers['games']> = async (
  _parent,
  _arg,
  _ctx,
) => {
  const gameReleases = await _ctx.api.gameRelease.getAll()

  const games = groupBy(gameReleases, (game) => game.name)
  return Object.values(games)
}
