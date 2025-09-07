import { Game } from '../../../../../../../../.generated/types.generated'
import { GameDetails } from '../../../../../../../feature/game/components/GameDetails'
import { GameByIdQuery } from '../../../../../../../feature/game/queries'
import RightDrawer from '../../../../../../../feature/shared/components/RightDrawer'
import { PreloadQuery } from '../../../../../../../feature/shared/gql/client'

interface GameDetailsPageProps {
  params: { username: string; libraryId: string; gameId: string }
}

async function GameDetailsPage({ params }: GameDetailsPageProps) {
  const { gameId } = await params

  return (
    <PreloadQuery<{ game: Game }, { id: string }>
      query={GameByIdQuery}
      variables={{ id: gameId }}
    >
      {(queryRef) => (
        <RightDrawer>
          <GameDetails gameId={gameId} queryRef={queryRef} />
        </RightDrawer>
      )}
    </PreloadQuery>
  )
}

export default GameDetailsPage
