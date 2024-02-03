import type { LoaderFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { useCallback, useMemo, useState } from 'react'
import PlayniteApi from '../api/playnite/index.server'
import GameGrid from '../components/GameGrid'
import FilteredGameList from '../domain/FilteredGameList'
import GameList from '../domain/GameList'
import MatchName from '../domain/filters/playnite/MatchName'
import type { GameOnPlatform } from '../domain/types'

async function loader({ request }: LoaderFunctionArgs) {
  const api = new PlayniteApi()
  const gamesOnPlatforms = await api.getGames()
  gamesOnPlatforms.sort((a, b) => {
    const aName = a.name
    const bName = b.name
    if (aName > bName) {
      return 1
    }
    if (aName < bName) {
      return -1
    }

    return 0
  })

  return json({
    gamesOnPlatforms,
  })
}

function Browse() {
  const { gamesOnPlatforms } = (useLoaderData() || {}) as unknown as {
    gamesOnPlatforms?: GameOnPlatform[]
  }

  const gameList = useMemo(() => {
    return new GameList(gamesOnPlatforms ?? [])
  }, [gamesOnPlatforms])

  const [nameQuery, setNameQuery] = useState<string>('')
  const handleFilter = useCallback((evt, userNameQuery) => {
    setNameQuery(userNameQuery)
  }, [])
  const filteredGames = useMemo(
    () => new FilteredGameList(gameList, new MatchName(nameQuery)),
    [gamesOnPlatforms, nameQuery],
  )

  return <GameGrid games={filteredGames} />
}

export default Browse
export { loader }
