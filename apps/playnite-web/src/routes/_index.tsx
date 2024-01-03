import type { LoaderFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { styled } from 'styled-components'
import PlayniteApi from '../api'
import type { Game, Playlist } from '../api/types'
import GameList from '../components/GameList.js'
import GameListItem from '../components/GameListItem'

async function loader({ request }: LoaderFunctionArgs) {
  const api = new PlayniteApi()

  const allPlaylists = await api.getPlaylists()
  const playlists = [
    allPlaylists.find((playlist) => playlist.name.toLowerCase() === 'on deck'),
    allPlaylists.find((playlist) => playlist.name.toLowerCase() === 'on deck'),
    allPlaylists.find((playlist) => playlist.name.toLowerCase() === 'up next'),
  ].filter((playlist) => !!playlist) as Playlist[]
  const playlistGames = await api.getPlaylistsGames(playlists)

  return json({
    playlists: playlistGames,
  })
}

const Main = styled.main`
  display: flex;
  height: 100vh;
  flex-direction: column;
  > * {
    margin: 16px !important;
  }
`
const PlaylistList = styled.ol`
  flex-direction: column;
  display: flex;
  margin: 0;
  padding: 0;
`
const PlaylistListItem = styled.li`
  flex: 1;
  flex-direction: column;
  display: flex;
  min-height: 452px;
  > * {
    justify-content: start !important;
  }
`

const spacing = 8
const maxGameWidth = 300
const maxGameHeight = (maxGameWidth * 4) / 3

function Index() {
  const { playlists } = useLoaderData<typeof loader>() as unknown as {
    playlists: [Playlist, Game[]][]
  }

  return (
    <Main>
      <PlaylistList>
        {playlists.map(([playlist, games]) => (
          <PlaylistListItem key={playlist.id}>
            <h2>{playlist.name}</h2>
            <GameList
              Game={GameListItem}
              games={games}
              maxGameHeight={maxGameHeight - spacing * 2}
              maxGameWidth={maxGameWidth - spacing * 2}
              spacing={spacing}
            />
          </PlaylistListItem>
        ))}
      </PlaylistList>
      <a href={`/browse`}>Browse All</a>
    </Main>
  )
}

export default Index
export { loader }
