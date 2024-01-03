import type { LoaderFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { styled } from 'styled-components'
import inferredLayout from '../api/layout'
import PlayniteApi from '../api/playnite'
import type { Game } from '../api/playnite/types'
import GameList from '../components/GameList'
import GameListItem from '../components/GameListItem'

async function loader({ request }: LoaderFunctionArgs) {
  const api = new PlayniteApi()
  const games = await api.getGames()
  games.sort((a, b) => {
    const aName = a.sortName
    const bName = b.sortName
    if (aName > bName) {
      return 1
    }
    if (aName < bName) {
      return -1
    }

    return 0
  })

  const [gameWidth, gameHeight] =
    await inferredLayout.getGameDimensions(request)

  return json({
    games,
    gameWidth,
    gameHeight,
  })
}

const Main = styled.main`
  display: flex;
  align-items: center;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
`

const spacing = 8

function Index() {
  const { games, gameWidth, gameHeight } = useLoaderData<
    typeof loader
  >() as unknown as {
    games: Game[]
    gameWidth: number
    gameHeight: number
  }

  return (
    <Main>
      <h1>Browse</h1>
      <GameList
        Game={GameListItem}
        games={games}
        gameHeight={gameHeight - spacing * 2}
        gameWidth={gameWidth - spacing * 2}
        spacing={spacing}
      />
    </Main>
  )
}

export default Index
export { loader }
