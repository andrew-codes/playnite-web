'use client'

import { Grid, Typography } from '@mui/material'
import { isEmpty } from 'lodash-es'
import { useUserLookup } from '../../account/hooks/userLookup'
import { Link } from '../../shared/components/Link'

interface UserLibrariesProps {
  username: string
}

const UserLibraries = ({ username }: UserLibrariesProps) => {
  const data = useUserLookup(username)

  const userData = data.data
  const loading = data.loading

  if (loading) {
    return null
  }

  if (isEmpty(userData?.lookupUser.libraries)) {
    return (
      <Typography>
        No libraries found for this user.
        <br />
        <Link href="/help/sync-library">Sync your Library</Link>
      </Typography>
    )
  }

  return (
    <Grid container spacing={2}>
      {userData?.lookupUser.libraries.map((library, i) => (
        <Grid key={library.id} size={3}>
          <div>
            <Link href={`/u/${username}/${library.id}`}>
              <Typography>{library.name ?? `Library ${i + 1}`}</Typography>
            </Link>
          </div>
        </Grid>
      ))}
    </Grid>
  )
}

export { UserLibraries }