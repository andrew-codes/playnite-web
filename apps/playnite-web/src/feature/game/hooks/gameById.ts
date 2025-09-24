'use client'

import { useQuery } from '@apollo/client/react'
import { merge } from 'lodash'
import { useEffect } from 'react'
import { Game } from '../../../../.generated/types.generated'
import { useSubscribeLibrarySync } from '../../libraries/hooks/subscribeLibrarySync'
import { GameByIdQuery } from '../queries'
import { useSubscribeEntityUpdates } from './subscribeEntityUpdates'

const useGameById = (id?: string, opts?: any) => {
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
    if (
      librarySubscription.data?.librarySynced.some(
        (e) => e.id == q.data?.game?.library?.id,
      )
    ) {
      q.refetch()
    }
  }, [librarySubscription?.data?.librarySynced, q])

  return q
}

export { useGameById }
