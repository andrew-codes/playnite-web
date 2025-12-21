'use client'

import { useQuery } from '@apollo/client/react'
import { merge } from 'lodash-es'
import { useEffect } from 'react'
import { Game } from '../../../../.generated/types.generated'
import { useSubscribeLibrarySync } from '../../library/hooks/subscribeLibrarySync'
import { useSubscribeEntityUpdates } from '../../shared/hooks/subscribeEntityUpdates'
import { GameByIdQuery } from '../queries'

const useSubscribeGameUpdates = (id?: string, opts?: any) => {
  const q = useQuery<{ game: Game }>(
    GameByIdQuery,
    merge({}, opts, {
      variables: {
        id: id ?? '',
      },
    }),
  )

  const { data } = useSubscribeEntityUpdates()
  useEffect(() => {
    if (
      id &&
      data?.entityUpdated.some(
        (e) =>
          e.type === 'Game' ||
          e.type === 'Release' ||
          e.type === 'Platform' ||
          e.type === 'Source' ||
          e.type === 'CompletionStatus' ||
          e.id === id,
      )
    ) {
      q.refetch()
    }
  }, [data?.entityUpdated, id, q])

  const librarySubscription = useSubscribeLibrarySync()
  useEffect(() => {
    if (id && librarySubscription.data?.librarySynced.some((e) => e.id == id)) {
      q.refetch()
    }
  }, [librarySubscription?.data?.librarySynced, id, q])

  return [q.refetch] as const
}

export { useSubscribeGameUpdates }
