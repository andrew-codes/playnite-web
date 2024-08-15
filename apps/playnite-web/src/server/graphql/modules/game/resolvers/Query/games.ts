import type { QueryResolvers } from '../../../../../../../.generated/types.generated'

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
          filters.push(game.name === _arg.filter.name.slice(1, -1))
        } else {
          filters.push(
            game.name.toLowerCase().includes(_arg.filter.name.toLowerCase()),
          )
        }
      }

      return filters.every((filter) => filter)
    })
    .sort((a, b) => a.name.localeCompare(b.name))
}
