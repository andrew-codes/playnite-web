import { LibraryLayout } from '../../../../feature/library/components/LibraryLayout'

interface LibraryPageProps {
  children: React.ReactNode
  filters: React.ReactNode
  gameDetails: React.ReactNode
  nowPlaying: React.ReactNode
  params: { username: string; libraryId: string }
}

async function LibraryPage({
  children,
  filters,
  gameDetails,
  nowPlaying,
  params,
}: LibraryPageProps) {
  const { username, libraryId } = await params

  return (
    <LibraryLayout username={username} libraryId={libraryId}>
      {children}
      {gameDetails}
      {filters}
      {nowPlaying}
    </LibraryLayout>
  )
}

export default LibraryPage
