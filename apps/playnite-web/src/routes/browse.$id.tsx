import { styled } from '@mui/material'
import { LoaderFunctionArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { useMemo } from 'react'
import { $params } from 'remix-routes'
import getGameApi from '../api/game/index.server'
import GameDetails from '../components/GameDetails'
import Game from '../domain/Game'
import { GameOnPlatform } from '../domain/types'

async function loader({ request, params }: LoaderFunctionArgs) {
  try {
    const { id } = $params('/browse/:id', params)

    const api = getGameApi()
    const game = await api.getGameById(id)
    return json({
      gamePlatforms: game.gamePlatforms,
    })
  } catch (e) {
    return new Response(null, {
      status: 500,
    })
  }
}

const BrowseGameRoot = styled('div')({
  textWrap: 'wrap',
})

function GameBrowserDetails() {
  const { gamePlatforms } = (useLoaderData() || {}) as unknown as {
    gamePlatforms: GameOnPlatform[]
  }

  const game = useMemo(() => new Game(gamePlatforms), [gamePlatforms])

  return <GameDetails game={game} />
}

export default GameBrowserDetails
export { loader }
