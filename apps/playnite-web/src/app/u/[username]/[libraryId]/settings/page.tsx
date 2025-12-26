import { LibrarySettings } from '../../../../../feature/library/components/LibrarySettings'

async function Account(props: {
  params: { username: string; libraryId: string }
}) {
  const { libraryId } = await props.params

  return (
    <>
      <LibrarySettings libraryId={libraryId} />
    </>
  )
}

export default Account
