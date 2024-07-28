import { unknownPlatform } from '../../api'
import type { QueryResolvers } from './../../../../types.generated'

const exactMatch = /(".*")|('.*')/

export const games: NonNullable<QueryResolvers['games']> = async (
  _parent,
  _arg,
  _ctx,
) => {
  return (await _ctx.api.game.getAll())
    .filter((game) => {
      if (!_arg.filter) {
        return true
      }

      const filters: Array<boolean> = []
      if (_arg.filter.name) {
        if (exactMatch.test(_arg.filter.name)) {
          filters.push(game[0].name === _arg.filter.name.slice(1, -1))
        } else {
          filters.push(
            game[0].name.toLowerCase().includes(_arg.filter.name.toLowerCase()),
          )
        }
      }

      return filters.every((filter) => filter)
    })
    .map((gameReleases) =>
      gameReleases.filter(
        (release) => release.platformSource.id !== unknownPlatform.id,
      ),
    )
    .filter((releases) => releases.length > 0)
    .sort((a, b) => a[0].name.localeCompare(b[0].name))
}
