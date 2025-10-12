import { Game, Library } from '../../../../../../../.generated/types.generated'
import { GameDetails } from '../../../../../../feature/game/components/GameDetails'
import { GameByIdQuery } from '../../../../../../feature/game/queries'
import MyLibrary from '../../../../../../feature/library/components/MyLibrary'
import { AllGamesQuery } from '../../../../../../feature/library/queries'
import RightDrawer from '../../../../../../feature/shared/components/RightDrawer'
import { PreloadQuery } from '../../../../../../feature/shared/gql/client'

interface GameDetailsPageProps {
  params: { username: string; libraryId: string; gameId: string }
}

async function GameDetailsPage({ params }: GameDetailsPageProps) {
  const { gameId, libraryId, username } = await params

  return (
    <PreloadQuery<{ library: Library }, { libraryId: string }>
      query={AllGamesQuery}
      variables={{ libraryId }}
    >
      {(queryRef) => (
        <>
          <MyLibrary
            queryRef={queryRef}
            username={username}
            libraryId={libraryId}
          />
          <PreloadQuery<{ game: Game }, { id: string }>
            query={GameByIdQuery}
            variables={{ id: gameId }}
          >
            {(gameQueryRef) => (
              <RightDrawer disableTransition>
                <GameDetails gameId={gameId} queryRef={gameQueryRef} />
              </RightDrawer>
            )}
          </PreloadQuery>
        </>
      )}
    </PreloadQuery>
  )
}

export default GameDetailsPage
