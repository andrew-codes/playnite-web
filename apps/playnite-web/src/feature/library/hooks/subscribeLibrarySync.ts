import { useSubscription } from '@apollo/client/react'
import { LibrarySubscriptionQuery } from '../queries'

const useSubscribeLibrarySync = () =>
  useSubscription<{
    librarySynced: Array<{ id: string }>
  }>(LibrarySubscriptionQuery)

export { useSubscribeLibrarySync }