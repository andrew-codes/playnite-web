import { gql } from '@apollo/client/core/core.cjs'
import { useQuery } from '@apollo/client/react/hooks/hooks.cjs'
import { Library } from '../../.generated/types.generated'

const AllGames = gql`
  query library($input: String!) {
    library(libraryId: $input) {
      games {
        id
        completionStatus {
          name
        }
        primaryRelease {
          id
          title
          cover
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
    }
  }
`

const useAllGames = (username: string) => {
  const q = useQuery<{ library: Library }>(AllGames, {
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
