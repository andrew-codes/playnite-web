import FilteringDrawer from '../../../../../../feature/filtering/components/FilteringDrawer'

interface GameDetailsPageProps {
  params: { username: string; libraryId: string }
}

async function Filters({ params }: GameDetailsPageProps) {
  return <FilteringDrawer />
}

export default Filters
