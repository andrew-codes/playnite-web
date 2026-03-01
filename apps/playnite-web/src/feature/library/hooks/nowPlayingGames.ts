'use client'

import { useQuery } from '@apollo/client/react'
import { merge } from 'lodash-es'
import { useEffect } from 'react'
import { Library } from '../../../../.generated/types.generated'
import { useSubscribeEntityUpdates } from '../../shared/hooks/subscribeEntityUpdates'
import { LibraryGamesNowPlayingQuery } from '../queries'
import { useSubscribeLibrarySync } from './subscribeLibrarySync'

const useNowPlayingGames = (libraryId: string, opts?: any) => {
  const q = useQuery<{ library: Library }>(
    LibraryGamesNowPlayingQuery,
    merge({}, opts, {
      variables: { libraryId },
    }),
  )

  const entityUpdatedSubscription = useSubscribeEntityUpdates()
  useEffect(() => {
    if (
      entityUpdatedSubscription.data?.entityUpdated.some(
        (e) =>
          e.type === 'Release' &&
          e.fields.some((field) => field.key === 'runState'),
      )
    ) {
      q.refetch()
    }
  }, [q, entityUpdatedSubscription?.data?.entityUpdated])

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

export { useNowPlayingGames }
