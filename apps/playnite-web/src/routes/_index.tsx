import { Typography } from '@mui/material'
import type { LoaderFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import _ from 'lodash'
import { Fragment, useCallback, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet'
import PlayniteApi from '../api/playnite/index.server'
import GameGrid from '../components/GameGrid'
import WithNavigation from '../components/WithNavigation'
import GameList from '../domain/GameList'
import MatchName from '../domain/playnite/matchName'
import type { GameOnPlatform, IGameList, Playlist } from '../domain/types'

const { uniqBy } = _

async function loader({ request }: LoaderFunctionArgs) {
  const api = new PlayniteApi()

  const allPlaylists = await api.getPlaylists()

  const playing = allPlaylists.find(
    (playlist) => playlist.name.toLowerCase() === 'on deck',
  )
  const upNext = allPlaylists.find(
    (playlist) => playlist.name.toLowerCase() === 'up next',
  )
  const playlists = [playing, upNext].filter(
    (playlist) => !!playlist,
  ) as Playlist[]

  const playlistGames = await api.getPlaylistsGames(playlists)

  return json({
    playlists: playlistGames,
  })
}

function Index() {
  const { playlists } = useLoaderData() as unknown as {
    playlists: [Playlist, GameOnPlatform[]][]
  }

  const [nameQuery, setNameQuery] = useState<string>('')
  const handleFilter = useCallback(
    (evt, nameQuery) => setNameQuery(nameQuery),
    [],
  )
  const playlistsOfGameLists: [Playlist, IGameList][] = useMemo(() => {
    return playlists.map(([playlist, games]) => [
      playlist,
      new GameList(games, new MatchName(nameQuery)),
    ])
  }, [playlists, nameQuery])

  const numberToPreload = 40
  const [preloadGames, prefetchGames] = useMemo(() => {
    const uniqueGames = uniqBy(
      playlists.flatMap(([playlist, games]) => new GameList(games).games),
      (game) => game.oid.asString,
    )
    return [
      uniqueGames.slice(0, numberToPreload),
      uniqueGames.slice(numberToPreload + 1),
    ]
  }, [])

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
        {playlistsOfGameLists.map(([playlist, gameList]) => (
          <Fragment key={playlist.id}>
            <Typography variant="h3">{playlist.name}</Typography>
            <GameGrid games={gameList.games} />
          </Fragment>
        ))}
      </WithNavigation>
    </>
  )
}

export default Index
export { loader }
