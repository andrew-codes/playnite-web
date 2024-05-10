import { styled } from '@mui/material'
import { LoaderFunctionArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { useMemo } from 'react'
import { $params } from 'remix-routes'
import getGameApi from '../api/game/index.server'
import GameDetails from '../components/GameDetails'
import Game from '../domain/Game'
import GameOnPlatform from '../domain/GameOnPlatform'
import { CompositeOid } from '../domain/Oid'
import { GameOnPlatformDto } from '../domain/types'

async function loader({ request, params }: LoaderFunctionArgs) {
  try {
    const { id } = $params('/browse/:id', params)

    const api = getGameApi()
    const game = await api.getGameById(new CompositeOid(id))
    return json({
      game: game ?? [],
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

function GameBrowseDetails() {
  const data = (useLoaderData() || {}) as unknown as {
    game: GameOnPlatformDto[]
  }
  const game = useMemo(
    () => new Game(data.game.map((gp) => new GameOnPlatform(gp))),
    [data.game],
  )

  return <GameDetails game={game} />
}

export default GameBrowseDetails
export { loader }
