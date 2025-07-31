import { gql } from '@apollo/client/core/core.cjs'
import { useQuery } from '@apollo/client/react/hooks/hooks.cjs'
import { Game } from '../../.generated/types.generated'

const AllGames = gql`
  query library($input: String!) {
    library(username: $input) {
      games {
        id
        completionStatus {
          name
        }
        primaryRelease {
          id
          title
          cover {
            id
          }
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
  }
`

const useAllGames = (username: string) => {
  const q = useQuery<{ games: Array<Game> }>(AllGames, {
    variables: { input: username },
  })

  return q
}
// const useAllGames = (opts: QueryHookOptions) => {
//   const q = useQuery<{ games: Array<Game> }>(All_Games_Query, opts)

//   const { data } = useSubscribePlayniteEntityUpdates()
//   useEffect(() => {
//     if (!isEmpty(data?.playniteEntitiesUpdated)) {
//       q.refetch()
//     }
//   }, [data?.playniteEntitiesUpdated])

//   return q
// }

export { AllGames, useAllGames }
