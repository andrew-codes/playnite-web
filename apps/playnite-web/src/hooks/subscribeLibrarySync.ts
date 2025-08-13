import { gql } from '@apollo/client/core/core.cjs'
import { useSubscription } from '@apollo/client/react/hooks/hooks.cjs'

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
