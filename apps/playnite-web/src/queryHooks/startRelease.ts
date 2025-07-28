import { gql } from '@apollo/client/core/core.cjs'
import { useMutation } from '@apollo/client/react/hooks/hooks.cjs'
import { Release } from '../../.generated/types.generated'
import { Game_By_Id_Query } from './gameById'
import { AllPlaylists } from './playlists'

const Activate_Mutation = gql`
  mutation startGameRelease($releaseId: String!) {
    startGameRelease(releaseId: $releaseId) {
      id
      game {
        id
      }
    }
  }
`

const useStartRelease = () => {
  return useMutation<{ startGameRelease: Release }>(Activate_Mutation, {
    update(cache, mutationResult) {
      cache.updateQuery({ query: AllPlaylists }, (data) => {
        return {
          ...data,
          playlists: data?.playlists.map((playlist) => {
            return {
              ...playlist,
              games: playlist.games.map((game) => {
                return {
                  ...game,
                  releases: game.releases.map((release) => {
                    if (
                      release.id === mutationResult.data?.startGameRelease.id
                    ) {
                      return {
                        ...release,
                        runState: 'running',
                      }
                    }
                    return release
                  }),
                }
              }),
            }
          }),
        }
      })
      cache.updateQuery(
        {
          query: Game_By_Id_Query,
          variables: { id: mutationResult?.data?.startGameRelease.game.id },
        },
        (data) => {
          return {
            ...data,
            game: {
              ...data?.game,
              releases: data?.game.releases.map((release) => {
                if (release.id === mutationResult.data?.startGameRelease.id) {
                  return {
                    ...release,
                    runState: 'running',
                  }
                }
                return release
              }),
            },
          }
        },
      )
    },
  })
}
export { Activate_Mutation, useStartRelease }
