import { Typography } from '@mui/material'
import type { LoaderFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { Fragment } from 'react'
import PlayniteApi from '../api/playnite/index.server'
import type { Game, Playlist } from '../api/playnite/types'
import GameGrid from '../components/GameGrid'
import WithNavigation from '../components/WithNavigation'

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

  return (
    <WithNavigation>
      {playlists.map(([playlist, games]) => (
        <Fragment key={playlist.id}>
          <Typography variant="h1">{playlist.name}</Typography>
          <GameGrid games={games} />
        </Fragment>
      ))}
    </WithNavigation>
  )
}

export default Index
export { loader }
