import { gql } from '@apollo/client/core'
import { useSubscription } from '@apollo/client/react'

const LibrarySubscriptionQuery = gql`
  subscription syncedLibrary {
    librarySynced {
      id
    }
  }
`

const useSubscribeLibrarySync = () =>
  useSubscription<{
    librarySynced: Array<{ id: string }>
  }>(LibrarySubscriptionQuery)

export { LibrarySubscriptionQuery, useSubscribeLibrarySync }
