import type { LoaderFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { useMemo } from 'react'
import useDimensions from 'react-use-dimensions'
import { styled } from 'styled-components'
import PlayniteApi from '../api'
import { Game } from '../api/types'
import GameList from '../components/GameList.js'

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

const Main = styled.main``

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
      <GameList
        rows={rows}
        columns={columns}
        games={games}
        maxGameHeight={maxGameHeight - spacing * 2}
        maxGameWidth={maxGameWidth - spacing * 2}
        spacing={spacing}
      />
    </Main>
  )
}

export default Index
export { loader }
