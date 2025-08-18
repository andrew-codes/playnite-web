import { gql } from '@apollo/client/core/core.cjs'
import { QueryHookOptions } from '@apollo/client/react'
import { useQuery } from '@apollo/client/react/hooks/hooks.cjs'
import { merge } from 'lodash-es'
import { useEffect } from 'react'
import { Library } from '../../.generated/types.generated'
import { useSubscribeEntityUpdates } from './subscribeEntityUpdates'
import { useSubscribeLibrarySync } from './subscribeLibrarySync'

const CompletionStatusFragment = gql`
  fragment CompletionStates on CompletionStatus {
    id
    name
  }
`

const GameFragment = gql`
  fragment Game on Game {
    id
    primaryRelease {
      id
      title
      cover
      completionStatus {
        name
      }
    }
    releases {
      id
      platform {
        id
        name
        icon
      }
      source {
        name
      }
    }
  }
`

const AllGames = gql`
  ${CompletionStatusFragment}
  ${GameFragment}

  query library($libraryId: String!) {
    library(libraryId: $libraryId) {
      id
      completionStates {
        ...CompletionStates
      }
      games {
        ...Game
      }
    }
  }
`

const useAllGames = (
  libraryId?: string,
  opts?: Omit<QueryHookOptions, 'variables'>,
) => {
  const q = useQuery<{ library: Library }>(
    AllGames,
    merge({}, opts, {
      variables: { libraryId: libraryId ?? '' },
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-and-network',
    }),
  )

  const { data } = useSubscribeEntityUpdates()
  useEffect(() => {
    if (
      data?.entityUpdated.every(
        (e) =>
          e.type !== 'Game' &&
          e.type !== 'Release' &&
          e.type !== 'Platform' &&
          e.type !== 'Source' &&
          e.type !== 'CompletionStatus',
      )
    ) {
      return
    }

    q.refetch()
  }, [data?.entityUpdated])

  const librarySubscription = useSubscribeLibrarySync()
  useEffect(() => {
    if (
      librarySubscription.data?.librarySynced.every(
        (e) => e.id !== q.data?.library.id,
      )
    ) {
      return
    }

    q.refetch()
  }, [librarySubscription?.data?.librarySynced])

  return q
}

export { AllGames, CompletionStatusFragment, GameFragment, useAllGames }
