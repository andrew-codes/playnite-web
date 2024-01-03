import type { LoaderFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { useSelector } from 'react-redux'
import { styled } from 'styled-components'
import { getGameDimensions } from '../api/client/state/layoutSlice'
import PlayniteApi from '../api/server/playnite'
import type { Game } from '../api/server/playnite/types'
import GameList from '../components/GameList'
import GameListItem from '../components/GameListItem'
import WithNavigation from '../components/WithNavigation'

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

  return json({
    games,
  })
}

const Main = styled.main`
  display: flex;
  align-items: center;
  flex: 1;
  flex-direction: column;
  height: 100%;
`

const spacing = 8

function Index() {
  const { games } = useLoaderData<{
    games: Game[]
  }>()

  const [gameWidth, gameHeight] = useSelector(getGameDimensions)

  return (
    <WithNavigation>
      <Main>
        <GameList
          Game={GameListItem}
          games={games}
          gameHeight={gameHeight - spacing * 2}
          gameWidth={gameWidth - spacing * 2}
          spacing={spacing}
        />
      </Main>
    </WithNavigation>
  )
}

export default Index
export { loader }
