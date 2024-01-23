import { Stack } from '@mui/material'
import type { LoaderFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import PlayniteApi from '../api/playnite/index.server'
import type { Game, Playlist } from '../api/playnite/types'
import GameGrid from '../components/GameGrid'
import GameListItem from '../components/GameListItem'
import Typography from '../components/Typography'
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
      <Stack>
        {playlists.map(([playlist, games]) => (
          <div key={playlist.id}>
            <Typography variant="h1">{playlist.name}</Typography>
            <GameGrid games={games} Game={GameListItem} height={'300px'} />
          </div>
        ))}
      </Stack>
    </WithNavigation>
  )
}

export default Index
export { loader }
