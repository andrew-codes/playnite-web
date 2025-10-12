import { useMutation } from '@apollo/client/react'
import { Release } from '../../../../.generated/types.generated'
import { StartReleaseMutation } from '../queries'
import { runState } from '../runStates'

const useStartRelease = () => {
  return useMutation<{ startRelease: Release }>(StartReleaseMutation, {
    update(cache, mutationResult) {
      const releaseId = mutationResult?.data?.startRelease.id
      if (!releaseId) {
        return
      }
      cache.modify({
        id: cache.identify({ __typename: 'Release', id: releaseId }),
        fields: {
          runState() {
            return runState.starting
          },
        },
      })
    },
  })
}

export { useStartRelease }
