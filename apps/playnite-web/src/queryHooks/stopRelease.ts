import { gql } from '@apollo/client/core/core.cjs'
import { useMutation } from '@apollo/client/react/hooks/hooks.cjs'
import { GameRelease } from 'apps/playnite-web/.generated/types.generated'
import _ from 'lodash'

const { merge } = _

const Stop_Game_Release_Mutation = gql`
  mutation stopGameRelease($releaseId: String!) {
    stopGameRelease(releaseId: $releaseId) {
      id
    }
  }
`

const useStopRelease = () => {
  return useMutation<{ stopGameRelease: GameRelease }>(
    Stop_Game_Release_Mutation,
  )
}
export { Stop_Game_Release_Mutation, useStopRelease }
