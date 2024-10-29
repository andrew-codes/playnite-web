import { gql } from '@apollo/client/core/core.cjs'
import { useMutation } from '@apollo/client/react/hooks/hooks.cjs'
import { GameRelease } from 'apps/playnite-web/.generated/types.generated'
import _ from 'lodash'

const { merge } = _

const Activate_Mutation = gql`
  mutation startGameRelease($releaseId: String!) {
    startGameRelease(releaseId: $releaseId) {
      id
    }
  }
`

const useStartRelease = () => {
  return useMutation<{ startGameRelease: GameRelease }>(Activate_Mutation)
}
export { Activate_Mutation, useStartRelease }
