import { GameDetails } from '../../../../../../../feature/game/components/GameDetails'
import RightDrawer from '../../../../../../../feature/shared/components/RightDrawer'

interface GameDetailsPageProps {
  params: { username: string; libraryId: string; gameId: string }
}

async function GameDetailsPage({ params }: GameDetailsPageProps) {
  const { gameId } = await params

  return (
    <RightDrawer>
      <GameDetails gameId={gameId} />
    </RightDrawer>
  )
}

export default GameDetailsPage
