import { gql } from '@apollo/client/core/core.cjs'
import { QueryHookOptions } from '@apollo/client/react'
import { useQuery } from '@apollo/client/react/hooks/hooks.cjs'
import { Game } from 'apps/playnite-web/.generated/types.generated'

const Game_By_Id_Query = gql`
  query game($id: String!) {
    game(id: $id) {
      id
      name
      description
      cover {
        id
      }
      releases {
        id
        active
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

const useGameById = (opts: QueryHookOptions) =>
  useQuery<{ game: Game }>(Game_By_Id_Query, opts)

export { Game_By_Id_Query, useGameById }
