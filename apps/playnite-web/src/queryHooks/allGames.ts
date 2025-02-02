import { gql } from '@apollo/client/core/core.cjs'
import { QueryHookOptions } from '@apollo/client/react'
import { useQuery } from '@apollo/client/react/hooks/hooks.cjs'
import { Game } from 'apps/playnite-web/.generated/types.generated'
import { isEmpty } from 'lodash-es'
import { useEffect } from 'react'
import { subscribePlayniteUpdates } from './subscribePlayniteUpdates'

const All_Games_Query = gql`
  query allGames($filter: Filter) {
    games(filter: $filter) {
      id
      cover {
        id
      }
      name
      completionStatus {
        name
      }
      description
      releases {
        id
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

const useAllGames = (opts: QueryHookOptions) => {
  const q = useQuery<{ games: Array<Game> }>(All_Games_Query, opts)

  const { data } = subscribePlayniteUpdates()
  useEffect(() => {
    if (!isEmpty(data?.playniteEntitiesUpdated)) {
      q.refetch()
    }
  }, [data?.playniteEntitiesUpdated])

  return q
}

export { All_Games_Query, useAllGames }
