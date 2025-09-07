import { gql } from '@apollo/client/core'
import { useMutation } from '@apollo/client/react'
import { ReleaseInput } from 'apps/playnite-web/.generated/types.generated'
import { merge } from 'lodash-es'
import { AllGamesQuery } from './allGames'
import { GameByIdQuery } from './gameById'

const UpdateRelease = gql`
  mutation updateRelease($release: ReleaseInput!) {
    updateRelease(release: $release) {
      id
      game {
        id
        library {
          id
        }
      }
      title
      cover
      completionStatus {
        name
      }
      platform {
        id
        name
        icon
      }
    }
  }
`

const useUpdateRelease = () => {
  return useMutation<
    { id: string; game: { id: string; library: { id: string } } },
    { release: ReleaseInput }
  >(UpdateRelease, {
    update(cache, mutationResult) {
      cache.updateQuery(
        {
          query: AllGamesQuery,
          variables: { id: mutationResult?.data?.game?.library?.id },
        },
        (data: any) => {
          return merge({}, data ?? {}, {
            library: {
              games:
                data?.library?.games.map((game) => {
                  if (game.id === mutationResult.data?.game?.id) {
                    return merge({}, game, {
                      releases: game.releases.map((release) => {
                        if (release.id === mutationResult.data?.id) {
                          return merge({}, release, mutationResult?.data ?? {})
                        }
                        return release
                      }),
                    })
                  }
                  return game
                }) ?? [],
            },
          })
        },
      )

      cache.updateQuery(
        {
          query: GameByIdQuery,
          variables: { id: mutationResult?.data?.game?.id },
        },
        (data: any) => {
          return merge({}, data ?? {}, {
            game: {
              ...(data?.primaryRelease.id === mutationResult?.data?.id && {
                primaryRelease: mutationResult?.data ?? {},
              }),
              releases:
                data?.releases?.map((release) => {
                  if (release.id === mutationResult?.data?.id) {
                    return merge({}, release, mutationResult?.data ?? {})
                  }
                  return release
                }) ?? [],
            },
          })
        },
      )
    },
  })
}
export { UpdateRelease, useUpdateRelease }
