import { gql } from '@apollo/client/core'
import { useQuery } from '@apollo/client/react'
import { merge } from 'lodash-es'
import { useEffect } from 'react'
import { Library } from '../../../../.generated/types.generated'
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
      releaseYear
      platform {
        id
      }
      completionStatus {
        id
        name
      }
      features {
        id
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

const AllGamesQuery = gql`
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
  }, [librarySubscription?.data?.librarySynced])

  return q
}

export { AllGamesQuery, CompletionStatusFragment, GameFragment, useAllGames }
