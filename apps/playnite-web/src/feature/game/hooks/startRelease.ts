import { gql } from '@apollo/client/core'
import { useMutation } from '@apollo/client/react'
import { merge } from 'lodash-es'
import { Release } from '../../../../.generated/types.generated'
import { runState } from '../runStates'
import { GameByIdQuery } from './gameById'

const StartReleaseQuery = gql`
  mutation startRelease($id: String!) {
    startRelease(id: $id) {
      id
      game {
        id
      }
    }
  }
`

const useStartRelease = () => {
  return useMutation<{ startRelease: Release }>(StartReleaseQuery, {
    update(cache, mutationResult) {
      cache.updateQuery(
        {
          query: GameByIdQuery,
          variables: { id: mutationResult?.data?.startRelease.game.id },
        },
        (data: any) => {
          return merge({}, data ?? {}, {
            game: {
              releases: data?.game.releases.map((release: any) => {
                if (release.id === mutationResult.data?.startRelease.id) {
                  return merge({}, release, {
                    runState: runState.starting,
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

export { StartReleaseQuery, useStartRelease }
