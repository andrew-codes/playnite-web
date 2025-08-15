import { gql } from '@apollo/client/core'
import { QueryHookOptions } from '@apollo/client/react'
import { useQuery } from '@apollo/client/react/hooks/hooks.cjs'
import { merge } from 'lodash-es'
import { useEffect, useMemo } from 'react'
import { useSubscribeEntityUpdates } from './subscribeEntityUpdates'
import { useSubscribeLibrarySync } from './subscribeLibrarySync'

const AllCompletionStatesQuery = gql`
  query libraryCompletionStates($libraryId: String!) {
    library(libraryId: $libraryId) {
      completionStates {
        id
        name
      }
    }
  }
`

const allCompletionStates = (
  libraryId?: string,
  opts?: Omit<QueryHookOptions, 'variables'>,
) => {
  const options = useMemo(() => {
    return merge({}, opts, {
      variables: { libraryId: libraryId ?? '' },
    })
  }, [libraryId])

  const result = useQuery<{
    library: { completionStates: Array<{ id: string; name: string }> }
  }>(AllCompletionStatesQuery, options)

  const { data } = useSubscribeEntityUpdates()
  useEffect(() => {
    if (data?.entityUpdated.every((e) => e.type === 'CompletionStatus')) {
      return
    }
    result.refetch()
  }, [data?.entityUpdated])

  const librarySubscription = useSubscribeLibrarySync()
  useEffect(() => {
    if (
      librarySubscription.data?.librarySynced.every((e) => e.id !== libraryId)
    ) {
      return
    }

    result.refetch()
  }, [librarySubscription?.data?.librarySynced])

  return [result]
}

export { allCompletionStates, AllCompletionStatesQuery }
