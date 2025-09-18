import { gql } from '@apollo/client/core'
import { useMutation } from '@apollo/client/react'
import { merge } from 'lodash-es'
import { Release } from '../../../../.generated/types.generated'
import { runState } from '../runStates'
import { GameByIdQuery } from './gameById'

const StopReleaseQuery = gql`
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
  return useMutation<{ stopRelease: Release }>(StopReleaseQuery, {
    update(cache, mutationResult) {
      cache.updateQuery(
        {
          query: GameByIdQuery,
          variables: { id: mutationResult?.data?.stopRelease.game.id },
        },
        (data: any) => {
          return merge({}, data ?? {}, {
            game: {
              releases: data?.game.releases.map((release: any) => {
                if (release.id === mutationResult.data?.stopRelease.id) {
                  return merge({}, release, {
                    runState: runState.stopped,
                  })
                }
                return release
              }),
            },
          })
        },
      )
    },
  })
}

export { StopReleaseQuery, useStopRelease }
