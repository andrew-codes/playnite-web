import { gql } from '@apollo/client/core/core.cjs'
import { useMutation } from '@apollo/client/react/hooks/hooks.cjs'
import { GameRelease } from 'apps/playnite-web/.generated/types.generated'
import { Game_By_Id_Query } from './gameById'
import { AllPlaylists } from './playlists'

const Stop_Game_Release_Mutation = gql`
  mutation stopGameRelease($releaseId: String!) {
    stopGameRelease(releaseId: $releaseId) {
      id
      game {
        id
      }
    }
  }
`

const useStopRelease = () => {
  return useMutation<{ stopGameRelease: GameRelease }>(
    Stop_Game_Release_Mutation,
    {
      update: (cache, mutationResult) => {
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
                        release.id === mutationResult.data?.stopGameRelease.id
                      ) {
                        return {
                          ...release,
                          runState: 'installed',
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
            variables: { id: mutationResult.data?.stopGameRelease.game.id },
          },
          (data) => ({
            ...data,
            game: {
              ...data?.game,
              releases: data?.game.releases.map((release) => {
                if (release.id === mutationResult.data?.stopGameRelease.id) {
                  return {
                    ...release,
                    runState: 'installed',
                  }
                }

                return release
              }),
            },
          }),
        )
      },
    },
  )
}
export { Stop_Game_Release_Mutation, useStopRelease }
