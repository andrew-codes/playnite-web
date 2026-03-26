import FilteringDrawer from '../../../../../../../feature/filtering/components/FilteringDrawer'

interface OnDeckFiltersPageProps {
  params: { username: string; libraryId: string }
}

async function OnDeckFilters({ params }: OnDeckFiltersPageProps) {
  return <FilteringDrawer />
}

export default OnDeckFilters
