import { gql } from '@apollo/client/core/core.cjs'
import { QueryHookOptions } from '@apollo/client/react'
import { useQuery } from '@apollo/client/react/hooks/hooks.cjs'
import { Game } from 'apps/playnite-web/.generated/types.generated'
import { isEmpty } from 'lodash-es'
import { useEffect } from 'react'
import { subscribePlayniteUpdates } from './subscribePlayniteUpdates'

const Game_By_Id_Query = gql`
  query game($id: String!) {
    game(id: $id) {
      id
      name
      description
      cover {
        id
      }
      completionStatus {
        name
      }
      releases {
        id
        runState
        platform {
          id
          isConsole
          name
          icon {
            id
          }
        }
        source {
          name
        }
      }
    }
  }
`

const useGameById = (opts: QueryHookOptions) => {
  const q = useQuery<{ game: Game }>(Game_By_Id_Query, opts)

  const { data } = subscribePlayniteUpdates()
  useEffect(() => {
    if (!isEmpty(data?.playniteEntitiesUpdated)) {
      q.refetch()
    }
  }, [data?.playniteEntitiesUpdated])

  return q
}

export { Game_By_Id_Query, useGameById }
