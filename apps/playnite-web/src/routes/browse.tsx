import type { LoaderFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { styled } from 'styled-components'
import PlayniteApi from '../api'
import { Game } from '../api/types'
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

  const url = new URL(request.url)
  const width = url.searchParams.get('width')
  const height = url.searchParams.get('height')

  return json({
    games,
    width: !!width ? parseInt(width) : null,
    height: !!height ? parseInt(height) : null,
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
const maxGameWidth = 300
const maxGameHeight = (maxGameWidth * 4) / 3

function Index() {
  const { games, height, width } = useLoaderData<
    typeof loader
  >() as unknown as {
    games: Game[]
    width: number
    height: number
  }

  return (
    <Main>
      <h1>Browse</h1>
      <GameList
        Game={GameListItem}
        games={games}
        maxGameHeight={maxGameHeight - spacing * 2}
        maxGameWidth={maxGameWidth - spacing * 2}
        spacing={spacing}
        width={width}
        height={height}
      />
    </Main>
  )
}

export default Index
export { loader }
