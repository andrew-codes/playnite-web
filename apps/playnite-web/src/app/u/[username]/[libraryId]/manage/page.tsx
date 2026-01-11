import { ManageLibrary } from '../../../../../feature/libraryManagement/components/ManageLibrary'

async function Account(props: {
  params: { username: string; libraryId: string }
}) {
  const { libraryId } = await props.params

  return (
    <>
      <ManageLibrary libraryId={libraryId} />
    </>
  )
}

export default Account
