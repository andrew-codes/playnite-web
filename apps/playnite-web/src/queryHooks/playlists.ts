import { gql } from '@apollo/client/core/core.cjs'
import { useQuery } from '@apollo/client/react/hooks/hooks.cjs'
import { Playlist } from '../../.generated/types.generated'

const AllPlaylists = gql`
  query Playlist {
    playlists {
      id
      name
      games {
        id
        name
        description
        cover {
          id
        }
        releases {
          id
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

const usePlaylists = () =>
  useQuery<{ playlists: Array<Playlist> }>(AllPlaylists)

export { AllPlaylists, usePlaylists }
