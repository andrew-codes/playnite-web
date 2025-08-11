import { gql } from '@apollo/client/core/core.cjs'
import { QueryHookOptions } from '@apollo/client/react'
import { useQuery } from '@apollo/client/react/hooks/hooks.cjs'
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

const usePlaylists = (opts: QueryHookOptions) => {
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
