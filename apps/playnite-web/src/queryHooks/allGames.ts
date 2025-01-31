import { gql } from '@apollo/client/core/core.cjs'
import { QueryHookOptions } from '@apollo/client/react'
import { useQuery } from '@apollo/client/react/hooks/hooks.cjs'
import { Game } from 'apps/playnite-web/.generated/types.generated'

const All_Games_Query = gql`
  query allGames($filter: Filter) {
    games(filter: $filter) {
      id
      cover {
        id
      }
      name
      description
      releases {
        id
        completionStatus {
          name
        }
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

  return q
}

export { All_Games_Query, useAllGames }
