import { ensureAccountSetup } from '../../../../../feature/account/ensureAccountSetup'
import { GameDetails } from '../../../../../feature/game/components/GameDetails'
import { GameByIdQuery } from '../../../../../feature/game/hooks/gameById'
import { PreloadQuery } from '../../../../../feature/shared/gql/client'

interface GameDetailsPageProps {
  params: { username: string; libraryId: string; gameId: string }
}

async function GameDetailsPage({ params }: GameDetailsPageProps) {
  const { gameId } = await params

  return (
    <div>
      <PreloadQuery query={GameByIdQuery} variables={{ id: gameId }}>
        <GameDetails gameId={gameId} />
      </PreloadQuery>
    </div>
  )
}

export default ensureAccountSetup(GameDetailsPage)
