import MyLibrary from '../../../../feature/library/components/MyLibrary'

interface LibraryPageProps {
  params: { libraryId: string; username: string }
}

async function LibraryPage({ params }: LibraryPageProps) {
  const { libraryId, username } = await params
  return <MyLibrary username={username} libraryId={libraryId} />
}

export default LibraryPage
