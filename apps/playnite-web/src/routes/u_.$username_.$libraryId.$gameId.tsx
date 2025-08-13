import { useParams } from '@remix-run/react'
import GameDetails from '../components/GameDetails'
import { useGameById } from '../hooks/gameById'
import { requiresUserSetup } from '../server/loaders/requiresUserSetup'

const loader = requiresUserSetup()

function GameDetailsRoute() {
  const { gameId } = useParams()
  const { loading, data, error } = useGameById(gameId)

  if (error) {
    console.error(error)
  }
  if (loading || !data?.game) {
    return null
  }

  const game = data.game

  return <GameDetails game={game} />
}

type SearchParams = { username: string; libraryId: string; gameId: string }

export default GameDetailsRoute
export { loader, type SearchParams }
