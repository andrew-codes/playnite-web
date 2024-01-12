import styled from '@emotion/styled'
import type { LoaderFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import PlayniteApi from '../api/server/playnite/index.server'
import type { Game, Playlist } from '../api/server/playnite/types'
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

const Main = styled.main`
  display: flex;
  flex: 1;
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
  margin: 0 0 24px 0;
  min-height: 452px;
  > * {
    justify-content: start !important;
  }
`

const spacing = 8

function Index() {
  const { playlists } = useLoaderData() as unknown as {
    playlists: [Playlist, Game[]][]
  }

  return (
    <WithNavigation>
      <Main>
        <PlaylistList>
          {playlists.map(([playlist, games]) => (
            <PlaylistListItem key={playlist.id}>
              <Heading>{playlist.name}</Heading>
              {/* <GameList
                Game={GameListItem}
                games={games}
                gameHeight={gameHeight - spacing * 2}
                gameWidth={gameWidth - spacing * 2}
                spacing={spacing}
              /> */}
            </PlaylistListItem>
          ))}
        </PlaylistList>
      </Main>
    </WithNavigation>
  )
}

export default Index
export { loader }
