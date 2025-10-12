import { Library } from '../../../../../../.generated/types.generated'
import Filtering from '../../../../../feature/filtering/components/Filtering'
import MyLibrary from '../../../../../feature/library/components/MyLibrary'
import { AllGamesQuery } from '../../../../../feature/library/queries'
import RightDrawer from '../../../../../feature/shared/components/RightDrawer'
import { PreloadQuery } from '../../../../../feature/shared/gql/client'

interface FiltersPageProps {
  params: { username: string; libraryId: string }
}

async function Filters({ params }: FiltersPageProps) {
  const { libraryId, username } = await params

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

          <RightDrawer disableTransition>
            <Filtering />
          </RightDrawer>
        </>
      )}
    </PreloadQuery>
  )
}

export default Filters
