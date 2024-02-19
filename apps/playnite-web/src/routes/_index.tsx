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
    const games = await api.getGames()
    return json({
      lists: [
        {
          name: 'Playing',
          games: games.filter(
            (game) => game.completionStatus?.name === 'Playing',
          ),
        },
        {
          name: 'Up Next',
          games: games.filter(
            (game) => game.completionStatus?.name === 'Plan to Play',
          ),
        },
      ],
    })
  } catch (e) {
    console.error(e)
    return json({
      lists: [],
    })
  }
}

const noFilter = new NoFilter()

function Index() {
  const { lists } = (useLoaderData() || {}) as unknown as {
    lists?: Playlist[]
  }
  const gameListPlaylists = useMemo(() => {
    return (
      lists?.map((list) => ({
        ...list,
        games: new FilteredGameList(new GameList(list.games), noFilter),
      })) ?? []
    )
  }, [lists])

  return (
    <Drawer>
      <OuterScroll>
        <Header>
          <Typography variant="h2">Library</Typography>
        </Header>
        {gameListPlaylists.map((playlist) => (
          <section>
            <Typography variant="h4">{playlist?.name}</Typography>
            <HorizontalGameList games={playlist.games} noDeferCount={5} />
          </section>
        ))}
      </OuterScroll>
    </Drawer>
  )
}

export default Index
export { loader }
