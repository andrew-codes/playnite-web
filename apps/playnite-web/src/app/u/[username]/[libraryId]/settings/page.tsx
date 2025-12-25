import { Typography } from '@mui/material'
import { LibrarySettings } from 'apps/playnite-web/src/feature/library/components/LibrarySettings'

async function Account(props: {
  params: { username: string; libraryId: string }
}) {
  const { username, libraryId } = await props.params

  return (
    <>
      <Typography variant="h1">Settings</Typography>
      <LibrarySettings libraryId={libraryId} />
    </>
  )
}

export default Account
