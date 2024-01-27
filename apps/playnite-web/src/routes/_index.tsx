import { Typography } from '@mui/material'
import type { LoaderFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import _ from 'lodash'
import { Fragment, useCallback, useMemo, useState } from 'react'
import PlayniteApi from '../api/playnite/index.server'
import GameGrid from '../components/GameGrid'
import WithNavigation from '../components/WithNavigation'
import FilteredGameList from '../domain/FilteredGameList'
import GameList from '../domain/GameList'
import MatchName from '../domain/playnite/matchName'
import type {
  GameOnPlatform,
  IFilterList,
  IGame,
  IList,
  Playlist,
} from '../domain/types'

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
  const playlistsOfGameLists: [Playlist, IList<IGame>][] = useMemo(() => {
    return playlists.map(([playlist, games]) => [playlist, new GameList(games)])
  }, [playlists, nameQuery])

  const filteredPlaylistGameLists = useMemo(() => {
    return playlistsOfGameLists.map<[Playlist, IFilterList<IGame>]>(
      ([playlist, gameList]) => [
        playlist,
        new FilteredGameList(gameList, new MatchName(nameQuery)),
      ],
    )
  }, [])

  return (
    <WithNavigation onFilter={handleFilter}>
      {filteredPlaylistGameLists.map(([playlist, gameList]) => (
        <Fragment key={playlist.id}>
          <Typography variant="h3">{playlist.name}</Typography>
          <GameGrid gameMatches={gameList.items} />
        </Fragment>
      ))}
    </WithNavigation>
  )
}

export default Index
export { loader }
