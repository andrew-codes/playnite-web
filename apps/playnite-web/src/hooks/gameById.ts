import { gql } from '@apollo/client/core/core.cjs'
import { QueryHookOptions } from '@apollo/client/react'
import { useQuery } from '@apollo/client/react/hooks/hooks.cjs'
import { merge } from 'lodash-es'
import { useEffect } from 'react'
import { Game } from '../../.generated/types.generated'
import { useSubscribeEntityUpdates } from './subscribeEntityUpdates'
import { useSubscribeLibrarySync } from './subscribeLibrarySync'

const Game_By_Id_Query = gql`
  query game($id: String!) {
    game(id: $id) {
      id
      library {
        id
      }
      primaryRelease {
        title
        description
        cover
        completionStatus {
          name
        }
      }
      releases {
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
  id: string,
  opts?: Omit<QueryHookOptions, 'variables'>,
) => {
  const q = useQuery<{ game: Game }>(
    Game_By_Id_Query,
    merge({}, opts, {
      variables: {
        id,
      },
    }),
  )

  const { data } = useSubscribeEntityUpdates()
  useEffect(() => {
    if (
      data?.entityUpdated.some(
        (e) =>
          e.type !== 'Game' &&
          e.type !== 'Release' &&
          e.type !== 'Platform' &&
          e.type !== 'Source' &&
          e.type !== 'CompletionStatus' &&
          e.id !== id,
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
        (e) => e.id !== q.data?.game.library.id,
      )
    ) {
      return
    }

    q.refetch()
  }, [librarySubscription?.data?.librarySynced])

  return q
}

export { Game_By_Id_Query, useGameById }
