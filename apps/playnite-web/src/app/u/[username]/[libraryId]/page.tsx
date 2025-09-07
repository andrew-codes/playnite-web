import { ensureAccountSetup } from 'apps/playnite-web/src/feature/account/ensureAccountSetup'
import { AllGamesQuery } from 'apps/playnite-web/src/feature/libraries/hooks/allGames'
import { LibraryGames } from 'apps/playnite-web/src/feature/libraries/components/LibraryGames'
import { PreloadQuery } from 'apps/playnite-web/src/feature/shared/gql/client'

interface LibraryPageProps {
  params: { username: string; libraryId: string }
}

async function LibraryPage({ params }: LibraryPageProps) {
  const { username, libraryId } = await params

  return (
    <PreloadQuery query={AllGamesQuery} variables={{ libraryId }}>
      <LibraryGames username={username} libraryId={libraryId} />
    </PreloadQuery>
  )
}

export default ensureAccountSetup(LibraryPage)