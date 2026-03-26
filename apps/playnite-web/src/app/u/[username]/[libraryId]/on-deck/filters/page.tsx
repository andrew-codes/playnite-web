import FilteringDrawer from '../../../../../../feature/filtering/components/FilteringDrawer'
import OnDeck from '../../../../../../feature/library/components/OnDeck'

interface OnDeckFiltersPageProps {
  params: { username: string; libraryId: string }
}

async function OnDeckFilters({ params }: OnDeckFiltersPageProps) {
  const { libraryId, username } = await params

  return (
    <>
      <OnDeck username={username} libraryId={libraryId} />

      <FilteringDrawer disableTransition />
    </>
  )
}

export default OnDeckFilters
