import { useQuery } from '@apollo/client/react'
import { merge } from 'lodash-es'
import { useEffect } from 'react'
import { Library } from '../../../../.generated/types.generated'
import { AllGamesQuery } from '../queries'
import { useSubscribeLibrarySync } from './subscribeLibrarySync'

const useAllGames = (libraryId?: string, opts?: any) => {
  const q = useQuery<{ library: Library }>(
    AllGamesQuery,
    merge({}, opts, {
      variables: { libraryId: libraryId ?? '' },
    }),
  )

  const librarySubscription = useSubscribeLibrarySync()
  useEffect(() => {
    if (
      librarySubscription.data?.librarySynced.some(
        (e) => e.id === q.data?.library?.id,
      )
    ) {
      q.refetch()
    }
  }, [q, librarySubscription?.data?.librarySynced])

  return q
}

export { useAllGames }
