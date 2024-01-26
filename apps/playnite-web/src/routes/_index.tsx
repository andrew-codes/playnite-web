import { Typography } from '@mui/material'
import type { LoaderFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import _ from 'lodash'
import { Fragment, useCallback, useState } from 'react'
import PlayniteApi from '../api/playnite/index.server'
import type { Game, Playlist } from '../api/playnite/types'
import GameGrid from '../components/GameGrid'
import WithNavigation from '../components/WithNavigation'

const { stubTrue } = _

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
    playlists: [Playlist, Game[]][]
  }

  const [[filterId, filter], setFilter] = useState<
    [string | null, (game: Game) => boolean]
  >([null, stubTrue as unknown as (game: Game) => boolean])
  const handleFilter = useCallback((id, filter) => setFilter([id, filter]), [])

  return (
    <WithNavigation onFilter={handleFilter}>
      {playlists.map(([playlist, games]) => (
        <Fragment key={playlist.id}>
          <Typography variant="h3">{playlist.name}</Typography>
          <GameGrid games={games.filter((game) => filter(game))} />
        </Fragment>
      ))}
    </WithNavigation>
  )
}

export default Index
export { loader }
