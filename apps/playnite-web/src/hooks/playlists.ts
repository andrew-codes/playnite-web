import { gql } from '@apollo/client/core/core.cjs'
import { useQuery } from '@apollo/client/react/hooks/hooks.cjs'
import { Playlist } from '../../.generated/types.generated'

const AllPlaylists = gql`
  query library($input: String!) {
    library(userId: $input) {
      playlists {
        id
        name
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
  }
`

const usePlaylists = (username: string) => {
  const q = useQuery<{ playlists: Array<Playlist> }>(AllPlaylists, {
    variables: { input: username },
  })

  // const { data } = useSubscribePlayniteEntityUpdates()
  // useEffect(() => {
  //   if (!isEmpty(data?.playniteEntitiesUpdated)) {
  //     q.refetch()
  //   }
  // }, [data?.playniteEntitiesUpdated])

  // const playniteWebRunStateUpdates = useSubscribePlayniteWebRunStateUpdates()
  // useEffect(() => {
  //   if (!isEmpty(playniteWebRunStateUpdates.data?.playniteWebRunStateUpdated)) {
  //     q.refetch()
  //   }
  // }, [playniteWebRunStateUpdates.data?.playniteWebRunStateUpdated])

  return q
}

export { AllPlaylists, usePlaylists }
