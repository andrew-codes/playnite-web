import Filtering from '../../../../../feature/filtering/components/Filtering'
import MyLibrary from '../../../../../feature/library/components/MyLibrary'
import RightDrawer from '../../../../../feature/shared/components/RightDrawer'

interface FiltersPageProps {
  params: { username: string; libraryId: string }
}

async function Filters({ params }: FiltersPageProps) {
  const { libraryId, username } = await params

  return (
    <>
      <MyLibrary username={username} libraryId={libraryId} />

      <RightDrawer disableTransition>
        <Filtering />
      </RightDrawer>
    </>
  )
}

export default Filters
