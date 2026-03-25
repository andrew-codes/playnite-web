import MyLibrary from '../../../../../feature/library/components/MyLibrary'
import FilteringDrawer from '../../../../../feature/filtering/components/FilteringDrawer'

interface FiltersPageProps {
  params: { username: string; libraryId: string }
}

async function Filters({ params }: FiltersPageProps) {
  const { libraryId, username } = await params

  return (
    <>
      <MyLibrary username={username} libraryId={libraryId} />

      <FilteringDrawer disableTransition />
    </>
  )
}

export default Filters
