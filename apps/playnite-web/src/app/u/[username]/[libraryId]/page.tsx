import { Library } from '../../../../../.generated/types.generated'
import MyLibrary from '../../../../feature/library/components/MyLibrary'
import { AllGamesQuery } from '../../../../feature/library/queries'
import { PreloadQuery } from '../../../../feature/shared/gql/client'

interface LibraryPageProps {
  params: { libraryId: string; username: string }
}

async function LibraryPage({ params }: LibraryPageProps) {
  const { libraryId, username } = await params
  return (
    <PreloadQuery<{ library: Library }, { libraryId: string }>
      query={AllGamesQuery}
      variables={{ libraryId }}
    >
      {(queryRef) => (
        <MyLibrary
          queryRef={queryRef}
          username={username}
          libraryId={libraryId}
        />
      )}
    </PreloadQuery>
  )
}

export default LibraryPage
