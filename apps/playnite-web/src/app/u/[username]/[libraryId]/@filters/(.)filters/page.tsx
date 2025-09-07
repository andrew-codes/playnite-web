import Filtering from '../../../../../../feature/filtering/components/Filtering'
import RightDrawer from '../../../../../../feature/shared/components/RightDrawer'

interface GameDetailsPageProps {
  params: { username: string; libraryId: string }
}

async function Filters({ params }: GameDetailsPageProps) {
  return (
    <RightDrawer>
      <Filtering />
    </RightDrawer>
  )
}

export default Filters
