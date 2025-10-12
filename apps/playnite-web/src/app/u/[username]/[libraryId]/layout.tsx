import { Library, User } from '../../../../../.generated/types.generated'
import { MeQuery } from '../../../../feature/account/queries'
import { LibraryLayout } from '../../../../feature/library/components/LibraryLayout'
import { AllGamesQuery } from '../../../../feature/library/queries'
import { PreloadQuery } from '../../../../feature/shared/gql/client'

interface LibraryPageProps {
  children: React.ReactNode
  filters: React.ReactNode
  gameDetails: React.ReactNode
  params: { username: string; libraryId: string }
}

async function LibraryPage({
  children,
  filters,
  gameDetails,
  params,
}: LibraryPageProps) {
  const { username, libraryId } = await params

  return (
    <PreloadQuery<{ library: Library }, { libraryId: string }>
      query={AllGamesQuery}
      variables={{ libraryId }}
    >
      {(queryRef) => (
        <PreloadQuery<{ me: User }, {}> query={MeQuery}>
          {(meQueryRef) => (
            <LibraryLayout
              meQueryRef={meQueryRef}
              username={username}
              libraryId={libraryId}
              queryRef={queryRef}
            >
              {children}
              {gameDetails}
              {filters}
            </LibraryLayout>
          )}
        </PreloadQuery>
      )}
    </PreloadQuery>
  )
}

export default LibraryPage
