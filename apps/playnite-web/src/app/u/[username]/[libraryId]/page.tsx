import { ensureAccountSetup } from '../../../../feature/account/ensureAccountSetup'
import { LibraryGames } from '../../../../feature/libraries/components/LibraryGames'
import { AllGamesQuery } from '../../../../feature/libraries/queries'
import { PreloadQuery } from '../../../../feature/shared/gql/client'

interface LibraryPageProps {
  params: { username: string; libraryId: string }
}

async function LibraryPage({ params }: LibraryPageProps) {
  const { username, libraryId } = await params

  return (
    <PreloadQuery query={AllGamesQuery} variables={{ libraryId: 'Library:1' }}>
      {(queryRef) => (
        <LibraryGames
          username={username}
          libraryId={libraryId}
          queryRef={queryRef}
        />
      )}
    </PreloadQuery>
  )
}

export default ensureAccountSetup(LibraryPage)
