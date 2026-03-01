import EmbeddableLibrary from '../../../../feature/library/components/EmbeddableLibrary'

interface EmbeddableLibraryPageProps {
  params: { libraryId: string; username: string }
}

async function EmbeddableLibraryPage({ params }: EmbeddableLibraryPageProps) {
  const { libraryId, username } = await params
  return <EmbeddableLibrary username={username} libraryId={libraryId} />
}

export default EmbeddableLibraryPage
