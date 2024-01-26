import type { LoaderFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import _ from 'lodash'
import { useCallback, useMemo, useState } from 'react'
import PlayniteApi from '../api/playnite/index.server'
import type { Game } from '../api/playnite/types'
import GameGrid from '../components/GameGrid'
import WithNavigation from '../components/WithNavigation'

const { debounce, merge, stubTrue } = _

async function loader({ request }: LoaderFunctionArgs) {
  const api = new PlayniteApi()
  const games = await api.getGames()
  games.sort((a, b) => {
    const aName = a.sortName
    const bName = b.sortName
    if (aName > bName) {
      return 1
    }
    if (aName < bName) {
      return -1
    }

    return 0
  })

  return json({
    games,
  })
}

function Browse() {
  const { games } = useLoaderData() as unknown as {
    games: Game[]
  }

  const [[filterId, filter], setFilter] = useState<
    [string | null, (game: Game) => boolean]
  >([null, stubTrue as unknown as (game: Game) => boolean])
  const handleFilter = useCallback((id, filter) => setFilter([id, filter]), [])
  const filteredGames = useMemo(
    () => games.filter((game) => filter(game)),
    [games, filterId],
  )

  return (
    <WithNavigation onFilter={handleFilter}>
      <GameGrid games={filteredGames} />
    </WithNavigation>
  )
}

export default Browse
export { loader }
