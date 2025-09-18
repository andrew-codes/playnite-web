import { ensureAccountSetup } from 'apps/playnite-web/src/feature/account/ensureAccountSetup'
import { GameDetails } from 'apps/playnite-web/src/feature/game/components/GameDetails'
import { GameByIdQuery } from 'apps/playnite-web/src/feature/game/hooks/gameById'
import { PreloadQuery } from 'apps/playnite-web/src/feature/shared/gql/client'

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
