import type { LoaderFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { useMemo } from 'react'
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

  const url = new URL(request.url)
  const width = url.searchParams.get('width')
  const height = url.searchParams.get('height')

  return json({
    playlists: playlistGames,
    width: !!width ? parseInt(width) : null,
    height: !!height ? parseInt(height) : null,
  })
}

const Main = styled.main``

const spacing = 8
const maxGameWidth = 300
const maxGameHeight = (maxGameWidth * 4) / 3

function Index() {
  const { playlists, height, width } = useLoaderData<
    typeof loader
  >() as unknown as {
    width: number
    height: number
    playlists: [Playlist, Game[]][]
  }

  const [ref, { width: actualWidth, height: actualHeight }] = useDimensions()

  const [rows, columns] = useMemo(() => {
    if (width && height) {
      const rows = Math.floor(height / maxGameHeight)
      const columns = Math.floor(width / maxGameWidth)
      return [rows, columns]
    }

    if (actualWidth && actualHeight) {
      const rows = Math.floor(actualHeight / maxGameHeight)
      const columns = Math.floor(actualWidth / maxGameWidth)
      return [rows, columns]
    }

    return [6, 12]
  }, [width, height, actualWidth, actualHeight])

  return (
    <Main ref={ref}>
      {playlists.map(([playlist, games]) => (
        <section key={playlist.id}>
          <h2>{playlist.name}</h2>
          <GameList
            rows={rows}
            columns={columns}
            games={games}
            maxGameHeight={maxGameHeight - spacing * 2}
            maxGameWidth={maxGameWidth - spacing * 2}
            spacing={spacing}
          />
        </section>
      ))}
      <a href={`/browse?width=${width}&height=${height}`}>Browse All</a>
    </Main>
  )
}

export default Index
export { loader }
