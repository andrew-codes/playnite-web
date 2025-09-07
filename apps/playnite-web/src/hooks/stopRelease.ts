import { gql } from '@apollo/client/core'
import { useMutation } from '@apollo/client/react'
import { merge } from 'lodash-es'
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
        (data: any) =>
          merge({}, data ?? {}, {
            game: {
              releases: data?.game.releases.map((release) => {
                if (release.id === mutationResult.data?.stopRelease.id) {
                  return merge({}, release, {
                    runState: 'installed',
                  })
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
