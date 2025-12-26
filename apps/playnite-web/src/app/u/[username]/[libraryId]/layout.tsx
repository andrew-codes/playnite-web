import { LibraryLayout } from '../../../../feature/library/components/LibraryLayout'

interface LibraryPageProps {
  children: React.ReactNode
  filters: React.ReactNode
  gameDetails: React.ReactNode
  params: { username: string; libraryId: string }
}

async function LibraryPage({
  children,
  filters,
  gameDetails,
  params,
}: LibraryPageProps) {
  const { username, libraryId } = await params

  return (
    <LibraryLayout username={username} libraryId={libraryId} title="My Games">
      {children}
      {gameDetails}
      {filters}
    </LibraryLayout>
  )
}

export default LibraryPage
