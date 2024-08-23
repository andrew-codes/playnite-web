import { WithId } from 'mongodb'
import type { QueryResolvers } from '../../../../../../../.generated/types.generated'
import { GameEntity } from '../../../../resolverTypes'

const exactMatch = /(".*")|('.*')/

export const games: NonNullable<QueryResolvers['games']> = async (
  _parent,
  _arg,
  _ctx,
) => {
  const matchedGames = (
    await Promise.all(
      (await _ctx.api.game.getAll()).reduce(
        (games, game) => {
          if (!_arg.filter) {
            return games.concat(Promise.resolve(game))
          }

          const filters: Array<boolean> = []
          if (_arg.filter.name) {
            if (exactMatch.test(_arg.filter.name)) {
              filters.push(game.name === _arg.filter.name.slice(1, -1))
            } else {
              filters.push(
                game.name
                  .toLowerCase()
                  .includes(_arg.filter.name.toLowerCase()),
              )
            }
          }

          if (_arg.filter.filterItems.length === 0) {
            if (filters.every((filter) => filter)) {
              return games.concat(Promise.resolve(game))
            }
          }

          return games.concat(
            Promise.all(
              _arg.filter.filterItems.map(async (filterItem) => {
                if (!filterItem?.field) {
                  return false
                }

                const releases = await Promise.all(
                  game.releases.map((release) =>
                    _ctx.api.gameRelease.getById(release),
                  ),
                )

                return releases.some((release) => {
                  const gameValue = release[filterItem.field]
                  if (gameValue === undefined) {
                    return false
                  }

                  let transformValue = (v) => v
                  if (typeof gameValue === 'number') {
                    transformValue = (v) => Number(v)
                  } else if (typeof gameValue === 'boolean') {
                    transformValue = (v) => Boolean(v)
                  } else if (gameValue instanceof Date) {
                    transformValue = (v) => new Date(v)
                  }

                  return filterItem?.values.some(
                    (value) => gameValue === transformValue(value),
                  )
                })
              }),
            ).then((filterItemResults) => {
              if (filters.concat(filterItemResults).every((filter) => filter)) {
                return game
              }

              return null
            }),
          )
        },
        [] as Array<Promise<WithId<GameEntity> | null>>,
      ),
    )
  ).filter((game) => game !== null) as Array<WithId<GameEntity>>

  return matchedGames.sort((a, b) => a.name.localeCompare(b.name))
}
