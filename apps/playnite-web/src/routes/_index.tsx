import type { LoaderFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import useDimensions from 'react-use-dimensions'
import { styled } from 'styled-components'
import PlayniteApi from '../api'
import GameList from '../components/GameList.js'

async function loader({ request }: LoaderFunctionArgs) {
  const api = new PlayniteApi()
  const games = await api.getGames()

  return json({
    games,
  })
}

const Main = styled.main``

function Index() {
  const { games } = useLoaderData<typeof loader>()

  const [ref, { width }] = useDimensions()

  return (
    <Main ref={ref}>
      <GameList width={width} columns={4} games={games} />
    </Main>
  )
}

export default Index
export { loader }
