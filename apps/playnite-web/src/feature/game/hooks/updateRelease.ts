import { useMutation } from '@apollo/client/react'
import { merge } from 'lodash'
import { ReleaseInput } from '../../../../.generated/types.generated'
import { AllGamesQuery } from '../../libraries/queries'
import { GameByIdQuery, UpdateReleaseMutation } from '../queries'

const useUpdateRelease = () => {
  return useMutation<
    { id: string; game: { id: string; library: { id: string } } },
    { release: ReleaseInput }
  >(UpdateReleaseMutation, {
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
export { useUpdateRelease }
