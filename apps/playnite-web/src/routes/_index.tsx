import type { LoaderFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import useDimensions from 'react-use-dimensions'
import { styled } from 'styled-components'
import GameList from '../components/GameList.js'

async function loader({ request }: LoaderFunctionArgs) {
  const games: any[] = [
    {
      id: '1',
      name: 'title 1',
    },
    {
      id: '2',
      name: 'title 1',
    },
    {
      id: '3',
      name: 'title 1',
    },
    {
      id: '4',
      name: 'title 1',
    },
    {
      id: '5',
      name: 'title 1',
    },
    {
      id: '6',
      name: 'title 1',
    },
    {
      id: '7',
      name: 'title 1',
    },
    {
      id: '8',
      name: 'title 1',
    },
    {
      id: '9',
      name: 'title 1',
    },
    {
      id: '10',
      name: 'title 1',
    },
    {
      id: '11',
      name: 'title 1',
    },
  ]

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
