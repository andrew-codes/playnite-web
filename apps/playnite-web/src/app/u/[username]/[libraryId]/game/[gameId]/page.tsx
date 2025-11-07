import { GameDetails } from '../../../../../../feature/game/components/GameDetails'
import MyLibrary from '../../../../../../feature/library/components/MyLibrary'
import RightDrawer from '../../../../../../feature/shared/components/RightDrawer'

interface GameDetailsPageProps {
  params: { username: string; libraryId: string; gameId: string }
}

async function GameDetailsPage({ params }: GameDetailsPageProps) {
  const { gameId, libraryId, username } = await params

  return (
    <>
      <MyLibrary username={username} libraryId={libraryId} />

      <RightDrawer disableTransition>
        <GameDetails gameId={gameId} />
      </RightDrawer>
    </>
  )
}

export default GameDetailsPage
