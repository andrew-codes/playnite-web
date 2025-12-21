'use client'

import { useQuery } from '@apollo/client/react'
import { Grid, Typography } from '@mui/material'
import { isEmpty } from 'lodash-es'
import { User } from '../../../../.generated/types.generated'
import { UserLookupQuery } from '../../account/queries'
import { Link } from '../../shared/components/Link'

interface UserLibrariesProps {
  username: string
}

const UserLibraries = ({ username }: UserLibrariesProps) => {
  const { data } = useQuery<{ lookupUser: User }>(UserLookupQuery, {
    variables: { username },
  })
  const user = data?.lookupUser

  if (isEmpty(user?.libraries)) {
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
      {user?.libraries.map((library, i) => (
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
