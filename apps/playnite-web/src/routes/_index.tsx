import { Typography } from '@mui/material'
import type { LoaderFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { useMemo } from 'react'
import getGameApi from '../api/game/index.server'
import Header from '../components/Header'
import HorizontalGameList from '../components/HorizontalGameList'
import Drawer from '../components/Navigation/Drawer'
import OuterScroll from '../components/OuterScroll'
import FilteredGameList from '../domain/FilteredGameList'
import GameList from '../domain/GameList'
import NoFilter from '../domain/filters/NoFilter'
import { Playlist } from '../domain/types'

async function loader({ request }: LoaderFunctionArgs) {
  const api = getGameApi()
  try {
    const playing = await api.getPlaylistByName('On Deck')
    return json({
      playing,
    })
  } catch (e) {
    console.error(e)
    return json({
      playing: {},
    })
  }
}

const noFilter = new NoFilter()

function Index() {
  const { playing } = (useLoaderData() || {}) as unknown as {
    playing?: Playlist
  }
  const playingPlaylist = useMemo(() => {
    return {
      ...playing,
      games: new FilteredGameList(new GameList(playing?.games || []), noFilter),
    }
  }, [playing])

  return (
    <Drawer>
      <OuterScroll>
        <Header>
          <Typography variant="h2">Library</Typography>
        </Header>
        <section>
          <Typography variant="h4">{playingPlaylist?.name}</Typography>
          <HorizontalGameList games={playingPlaylist.games} noDeferCount={5} />
        </section>
      </OuterScroll>
    </Drawer>
  )
}

export default Index
export { loader }
