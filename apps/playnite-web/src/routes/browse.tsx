import type { LoaderFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { useCallback, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet'
import PlayniteApi from '../api/playnite/index.server'
import GameGrid from '../components/GameGrid'
import WithNavigation from '../components/WithNavigation'
import GameList from '../domain/GameList'
import MatchName from '../domain/playnite/matchName'
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
  const { gamesOnPlatforms } = useLoaderData() as unknown as {
    gamesOnPlatforms: GameOnPlatform[]
  }

  const numberToPreload = 40
  const [preloadGames, prefetchGames] = useMemo(() => {
    const games = new GameList(gamesOnPlatforms)
    return [
      games.games.slice(0, numberToPreload),
      games.games.slice(numberToPreload + 1),
    ]
  }, [gamesOnPlatforms])

  const [nameQuery, setNameQuery] = useState<string>('')
  const handleFilter = useCallback((evt, userNameQuery) => {
    setNameQuery(userNameQuery)
  }, [])
  const gameList = useMemo(
    () => new GameList(gamesOnPlatforms, new MatchName(nameQuery)),
    [gamesOnPlatforms, nameQuery],
  )

  console.log(nameQuery)

  return (
    <>
      <Helmet>
        {preloadGames.map((game) => {
          return (
            <link
              key={game.oid.asString}
              rel="preload"
              as="image"
              href={game.cover}
            />
          )
        })}
        {prefetchGames.map((game) => {
          return (
            <link
              key={game.oid.asString}
              rel="prefetch"
              as="image"
              href={game.cover}
            />
          )
        })}
      </Helmet>
      <WithNavigation onFilter={handleFilter}>
        <GameGrid games={gameList.games} />
      </WithNavigation>
    </>
  )
}

export default Browse
export { loader }
