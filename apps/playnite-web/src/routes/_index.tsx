import type { LoaderFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import useDimensions from 'react-use-dimensions'
import { styled } from 'styled-components'
import PlayniteApi from '../api'
import { Game, Playlist } from '../api/types'
import GameList from '../components/GameList.js'

async function loader({ request }: LoaderFunctionArgs) {
  const api = new PlayniteApi()
  const featured = ['on deck', 'up next']
  const playlists = (await api.getPlaylists()).filter((playlist) =>
    featured.includes(playlist.name.toLowerCase()),
  )
  const playlistGames = (await api.getPlaylistsGames(playlists)).sort(
    (a, b) => {
      if (a[0].name.toLowerCase() === 'on deck') {
        return -1
      } else {
        return 1
      }
    },
  )

  return json({
    playlists: playlistGames,
  })
}

const Main = styled.main``

function Index() {
  const { playlists } = useLoaderData<typeof loader>() as unknown as {
    playlists: [Playlist, Game[]][]
  }

  const [ref, { width }] = useDimensions()

  return (
    <Main ref={ref}>
      {playlists.map(([playlist, games]) => (
        <section>
          <h2>{playlist.name}</h2>
          <GameList width={width} columns={12} games={games} />
        </section>
      ))}
    </Main>
  )
}

export default Index
export { loader }
