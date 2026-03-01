import { NowPlayingContent } from '../../../../../feature/library/components/NowPlayingContent'
import MyLibrary from '../../../../../feature/library/components/MyLibrary'
import TopDrawer from '../../../../../feature/shared/components/TopDrawer'

interface NowPlayingPageProps {
  params: { username: string; libraryId: string }
}

async function NowPlayingPage({ params }: NowPlayingPageProps) {
  const { libraryId, username } = await params

  return (
    <>
      <MyLibrary username={username} libraryId={libraryId} />
      <TopDrawer disableTransition>
        <NowPlayingContent username={username} libraryId={libraryId} />
      </TopDrawer>
    </>
  )
}

export default NowPlayingPage
