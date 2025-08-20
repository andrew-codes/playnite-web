import { gql } from '@apollo/client/core/core.cjs'
import { useMutation } from '@apollo/client/react/hooks/hooks.cjs'
import { Release } from '../../.generated/types.generated'
import { GameByIdQuery } from './gameById'

const StopReleaseMutation = gql`
  mutation stopRelease($id: String!) {
    stopRelease(id: $id) {
      id
      game {
        id
      }
    }
  }
`

const useStopRelease = () => {
  return useMutation<{ stopRelease: Release }>(StopReleaseMutation, {
    update: (cache, mutationResult) => {
      cache.updateQuery(
        {
          query: GameByIdQuery,
          variables: { id: mutationResult.data?.stopRelease.game.id },
        },
        (data) => ({
          ...data,
          game: {
            ...data?.game,
            releases: data?.game.releases.map((release) => {
              if (release.id === mutationResult.data?.stopRelease.id) {
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
  })
}
export { StopReleaseMutation, useStopRelease }
