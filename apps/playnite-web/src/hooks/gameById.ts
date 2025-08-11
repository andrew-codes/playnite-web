import { gql } from '@apollo/client/core/core.cjs'
import { QueryHookOptions } from '@apollo/client/react'
import { useQuery } from '@apollo/client/react/hooks/hooks.cjs'
import { Game } from '../../.generated/types.generated'

const Game_By_Id_Query = gql`
  query game($id: String!) {
    game(id: $id) {
      id
      primaryRelease {
        title
        description
        cover
      }
      completionStatus {
        name
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

const useGameById = (opts: QueryHookOptions) => {
  const q = useQuery<{ game: Game }>(Game_By_Id_Query, opts)

  return q
}

export { Game_By_Id_Query, useGameById }
