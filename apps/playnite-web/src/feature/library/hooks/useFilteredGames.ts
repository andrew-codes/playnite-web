import { DeepPartial } from '@apollo/client/utilities'
import { get } from 'lodash-es'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { Game } from '../../../../.generated/types.generated'
import { $filterValuesForQuery } from '../../../api/client/state/librarySlice'

export function useFilteredGames(games: DeepPartial<Game>[]): Array<Game> {
  const { nameFilter, filterItems } = useSelector($filterValuesForQuery)

  return useMemo(() => {
    let filteredGames = games

    filteredGames = filteredGames.filter((game) => {
      const releases =
        game.releases?.filter((release) => Boolean(release)) ?? []

      if (releases.length === 0) {
        return true
      }

      return !releases.every((release) => release?.hidden === true)
    })

    // Apply name filter
    if (nameFilter && nameFilter.trim() !== '') {
      const isExactMatch =
        (nameFilter.startsWith('"') && nameFilter.endsWith('"')) ||
        (nameFilter.startsWith("'") && nameFilter.endsWith("'"))

      if (isExactMatch) {
        const exactTerm = nameFilter.slice(1, -1).toLowerCase()
        filteredGames = filteredGames.filter(
          (game) => game.primaryRelease?.title?.toLowerCase() === exactTerm,
        )
      } else {
        const lowerNameFilter = nameFilter.toLowerCase()
        filteredGames = filteredGames.filter((game) =>
          game.primaryRelease?.title?.toLowerCase().includes(lowerNameFilter),
        )
      }
    }

    if (filterItems && filterItems.length > 0) {
      filteredGames = filteredGames.filter((game) => {
        return filterItems.every((filterItem) => {
          if (!filterItem.values || filterItem.values.length === 0) {
            return true
          }

          const gameValue = get(game, filterItem.field)

          if (!gameValue) {
            return false
          }

          if (Array.isArray(gameValue)) {
            return gameValue.some((item) => {
              const itemValue = item?.id?.toString() || item?.toString()
              return filterItem.values.includes(itemValue)
            })
          }

          const gameValueStr = gameValue?.toString()
          return filterItem.values.includes(gameValueStr)
        })
      })
    }

    return filteredGames as Array<Game>
  }, [games, nameFilter, filterItems])
}
