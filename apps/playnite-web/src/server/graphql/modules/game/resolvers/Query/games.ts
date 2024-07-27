import { unknownPlatform } from '../../api'
import type { QueryResolvers } from './../../../../types.generated'

export const games: NonNullable<QueryResolvers['games']> = async (
  _parent,
  _arg,
  _ctx,
) => {
  return (await _ctx.api.game.getAll())
    .map((gameReleases) =>
      gameReleases.filter(
        (release) => release.platformSource.id !== unknownPlatform.id,
      ),
    )
    .filter((releases) => releases.length > 0)
    .sort((a, b) => a[0].name.localeCompare(b[0].name))
}
