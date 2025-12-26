import OnDeck from '../../../../../feature/library/components/OnDeck'

interface LibraryPageProps {
  params: { libraryId: string; username: string }
}

async function LibraryPage({ params }: LibraryPageProps) {
  const { libraryId, username } = await params

  return <OnDeck username={username} libraryId={libraryId} />
}

export default LibraryPage
