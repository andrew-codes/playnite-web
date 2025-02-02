import { gql } from '@apollo/client/core/core.cjs'
import { useQuery } from '@apollo/client/react/hooks/hooks.cjs'
import { isEmpty } from 'lodash-es'
import { useEffect } from 'react'
import { Playlist } from '../../.generated/types.generated'
import { subscribePlayniteUpdates } from './subscribePlayniteUpdates'

const AllPlaylists = gql`
  query Playlist {
    playlists {
      id
      name
      games {
        id
        name
        description
        completionStatus {
          name
        }
        cover {
          id
        }
        releases {
          id
          runState
          name
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
  }
`

const usePlaylists = () => {
  const q = useQuery<{ playlists: Array<Playlist> }>(AllPlaylists)

  const { data } = subscribePlayniteUpdates()
  useEffect(() => {
    if (!isEmpty(data?.playniteEntitiesUpdated)) {
      q.refetch()
    }
  }, [data?.playniteEntitiesUpdated])

  return q
}

export { AllPlaylists, usePlaylists }
