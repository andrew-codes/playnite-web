import { gql } from '@apollo/client/core'
import { useQuery } from '@apollo/client/react'
import { Playlist } from '../../.generated/types.generated'

const AllPlaylists = gql`
  query library($userId: String!) {
    library(userId: $userId) {
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
  }
`

const usePlaylists = (
  opts: useQuery.Options<{ playlists: Array<Playlist> }>,
) => {
  const q = useQuery<{ playlists: Array<Playlist> }>(AllPlaylists, opts)

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
