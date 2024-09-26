import { useParams } from '@remix-run/react'
import GameDetails from '../components/GameDetails'
import { useGameById } from '../queryHooks/gameById'

function GameBrowseDetails() {
  const params = useParams()
  const { loading, data, error } = useGameById({
    variables: { id: params.id },
  })
  console.log(data?.game)
  if (loading || error || !data?.game) {
    return null
  }
  return <GameDetails game={data.game} />
}

export default GameBrowseDetails
