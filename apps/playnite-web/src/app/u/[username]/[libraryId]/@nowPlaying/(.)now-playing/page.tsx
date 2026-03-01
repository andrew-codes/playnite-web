import { NowPlayingContent } from '../../../../../../feature/library/components/NowPlayingContent'
import TopDrawer from '../../../../../../feature/shared/components/TopDrawer'

interface NowPlayingPageProps {
  params: { username: string; libraryId: string }
}

async function NowPlayingPage({ params }: NowPlayingPageProps) {
  const { username, libraryId } = await params

  return (
    <TopDrawer>
      <NowPlayingContent username={username} libraryId={libraryId} />
    </TopDrawer>
  )
}

export default NowPlayingPage
