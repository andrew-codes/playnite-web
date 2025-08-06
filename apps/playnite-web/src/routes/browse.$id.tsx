import { useParams } from '@remix-run/react'
import GameDetails from '../components/GameDetails'
import { useGameById } from '../queryHooks/gameById'
import { requiresUserSetup } from '../server/loaders/requiresUserSetup'

const loader = requiresUserSetup()

function GameBrowseDetails() {
  const params = useParams()
  const { loading, data, error } = useGameById({
    variables: { id: params.id },
  })
  if (loading || error || !data?.game) {
    return null
  }

  return <GameDetails game={data.game} />
}

export default GameBrowseDetails
export { loader }
