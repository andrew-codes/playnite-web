import { gql } from '@apollo/client/core/core.cjs'
import { useQuery } from '@apollo/client/react/hooks/hooks.cjs'
import { isEmpty } from 'lodash-es'
import { useEffect } from 'react'
import { Playlist } from '../../.generated/types.generated'
import { useSubscribePlayniteEntityUpdates } from './subscribePlayniteEntityUpdates'
import { useSubscribePlayniteWebRunStateUpdates } from './subscribePlayniteWebRunStateUpdates'

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
          playniteWebRunState
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

  const { data } = useSubscribePlayniteEntityUpdates()
  useEffect(() => {
    if (!isEmpty(data?.playniteEntitiesUpdated)) {
      q.refetch()
    }
  }, [data?.playniteEntitiesUpdated])

  const playniteWebRunStateUpdates = useSubscribePlayniteWebRunStateUpdates()
  useEffect(() => {
    if (!isEmpty(playniteWebRunStateUpdates.data?.playniteWebRunStateUpdated)) {
      q.refetch()
    }
  }, [playniteWebRunStateUpdates.data?.playniteWebRunStateUpdated])

  return q
}

export { AllPlaylists, usePlaylists }
