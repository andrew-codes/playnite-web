import { Typography } from '@mui/material'
import type { LoaderFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { useCallback, useMemo, useState } from 'react'
import getGameApi from '../api/game/index.server'
import GameDetails from '../components/GameDetails'
import Header from '../components/Header'
import HorizontalGameList from '../components/HorizontalGameList'
import Drawer from '../components/Navigation/Drawer'
import OuterScroll from '../components/OuterScroll'
import RightDrawer from '../components/RightDrawer'
import FilteredGameList from '../domain/FilteredGameList'
import Game from '../domain/Game'
import GameList from '../domain/GameList'
import NoFilter from '../domain/filters/NoFilter'
import { IGame, Playlist } from '../domain/types'

async function loader({ request }: LoaderFunctionArgs) {
  try {
    const api = getGameApi()
    const games = await api.getGames()

    return json({
      lists: [
        {
          name: 'Playing',
          games: games
            .filter((game) => game.completionStatus?.name === 'Playing')
            .map((game) => game.gamePlatforms),
        },
        {
          name: 'Up Next',
          games: games
            .filter((game) => game.completionStatus?.name === 'Plan to Play')
            .map((game) => game.gamePlatforms),
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
        games: new FilteredGameList(
          new GameList(
            list.games.map((gameOnPlatform) => new Game(gameOnPlatform)),
          ),
          noFilter,
        ),
      })) ?? []
    )
  }, [lists])

  const [isRightDrawerOpen, setRightDrawerOpen] = useState(false)
  const [game, setGame] = useState<IGame | null>(null)
  const handleClose = useCallback(() => {
    setRightDrawerOpen(false)
  }, [])
  const handleGameSelect = useCallback((evt, game: IGame) => {
    setGame(game)
    setRightDrawerOpen(true)
  }, [])

  return (
    <Drawer>
      <OuterScroll>
        <Header>
          <Typography variant="h2">Library</Typography>
        </Header>
        {gameListPlaylists.map((playlist, index) => (
          <section key={`${playlist?.name}${index}`}>
            <Typography variant="h4">{playlist?.name}</Typography>
            <HorizontalGameList
              games={playlist.games}
              noDeferCount={5}
              onSelect={handleGameSelect}
            />
          </section>
        ))}
      </OuterScroll>
      <RightDrawer open={isRightDrawerOpen} onClose={handleClose}>
        {game && <GameDetails game={game} />}
      </RightDrawer>
    </Drawer>
  )
}

export default Index
export { loader }
