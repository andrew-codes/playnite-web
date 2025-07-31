import { gql } from '@apollo/client/core/core.cjs'
import { QueryHookOptions } from '@apollo/client/react'
import { useQuery } from '@apollo/client/react/hooks/hooks.cjs'
import { isEmpty } from 'lodash-es'
import { useEffect } from 'react'
import { Game } from '../../.generated/types.generated'
import { useSubscribePlayniteEntityUpdates } from './subscribePlayniteEntityUpdates'
import { useSubscribePlayniteWebRunStateUpdates } from './subscribePlayniteWebRunStateUpdates'

const Game_By_Id_Query = gql`
  query game($id: String!) {
    game(id: $id) {
      id
      primaryRelease {
        title
        description
        cover {
          id
        }
      }
      completionStatus {
        name
      }
      releases {
        id
        platform {
          id
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

  const entityUpdates = useSubscribePlayniteEntityUpdates()
  useEffect(() => {
    if (!isEmpty(entityUpdates.data?.playniteEntitiesUpdated)) {
      q.refetch()
    }
  }, [entityUpdates.data?.playniteEntitiesUpdated])

  const playniteWebRunStateUpdates = useSubscribePlayniteWebRunStateUpdates()
  useEffect(() => {
    if (!isEmpty(playniteWebRunStateUpdates.data?.playniteWebRunStateUpdated)) {
      q.refetch()
    }
  }, [playniteWebRunStateUpdates.data?.playniteWebRunStateUpdated])

  return q
}

export { Game_By_Id_Query, useGameById }
