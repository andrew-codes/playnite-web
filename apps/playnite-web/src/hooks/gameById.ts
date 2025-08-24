import { gql } from '@apollo/client/core'
import { useQuery } from '@apollo/client/react'
import { merge } from 'lodash-es'
import { useEffect } from 'react'
import { Game } from '../../.generated/types.generated'
import { useSubscribeLibrarySync } from './subscribeLibrarySync'

const GameByIdQuery = gql`
  query game($id: String!) {
    game(id: $id) {
      id
      library {
        id
      }
      primaryRelease {
        id
        title
        description
        cover
        completionStatus {
          name
        }
      }
      releases {
        id
        runState
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
  }
`

const useGameById = (
  id?: string,
  opts?: Omit<useQuery.Options<{ game: Game }>, 'variables'>,
) => {
  const q = useQuery<{ game: Game }>(
    GameByIdQuery,
    merge({}, opts, {
      variables: {
        id: id ?? '',
      },
    }),
  )

  const librarySubscription = useSubscribeLibrarySync()
  useEffect(() => {
    if (
      librarySubscription.data?.librarySynced.every(
        (e) => e.id !== q.data?.game.library.id,
      )
    ) {
      return
    }

    q.refetch()
  }, [librarySubscription?.data?.librarySynced])

  return q
}

export { GameByIdQuery, useGameById }
