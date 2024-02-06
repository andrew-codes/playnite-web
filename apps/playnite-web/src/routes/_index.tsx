import { Typography } from '@mui/material'
import type { LoaderFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { useMemo } from 'react'
import PlayniteApi from '../api/playnite/index.server'
import Header from '../components/Header'
import HorizontalGameList from '../components/HorizontalGameList'
import GameList from '../domain/GameList'
import { Playlist } from '../domain/types'

async function loader({ request }: LoaderFunctionArgs) {
  const api = new PlayniteApi()

  const playing = await api.getPlaylistByName('On Deck')

  return json({
    playing,
  })
}

function Index() {
  const { playing } = (useLoaderData() || {}) as unknown as {
    playing?: Playlist
  }
  const playingPlaylist = useMemo(() => {
    return { ...playing, games: new GameList(playing?.games || []) }
  }, [playing])

  return (
    <>
      <Header>
        <Typography variant="h2">Library</Typography>
      </Header>
      <section>
        <Typography variant="h4">{playingPlaylist?.name}</Typography>
        <HorizontalGameList games={playingPlaylist.games} />
      </section>
    </>
  )
}

export default Index
export { loader }
