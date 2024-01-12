import styled from '@emotion/styled'
import { Stack } from '@mui/material'
import type { LoaderFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import PlayniteApi from '../api/server/playnite/index.server'
import type { Game, Playlist } from '../api/server/playnite/types'
import GameGrid from '../components/GameGrid'
import GameListItem from '../components/GameListItem'
import { Heading } from '../components/Headings'
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

const PlaylistListItem = styled.section`
  flex: 1;
  flex-direction: column;
  display: flex;
  > * {
    justify-content: start !important;
  }
`

function Index() {
  const { playlists } = useLoaderData() as unknown as {
    playlists: [Playlist, Game[]][]
  }

  return (
    <WithNavigation>
      <Stack>
        {playlists.map(([playlist, games]) => (
          <PlaylistListItem key={playlist.id}>
            <Heading>{playlist.name}</Heading>
            <GameGrid
              games={games}
              rows={1}
              columns={6}
              Game={GameListItem}
              spacing={0}
            />
          </PlaylistListItem>
        ))}
      </Stack>
    </WithNavigation>
  )
}

export default Index
export { loader }
