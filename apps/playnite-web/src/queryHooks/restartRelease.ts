import { gql } from '@apollo/client/core/core.cjs'
import { useMutation } from '@apollo/client/react/hooks/hooks.cjs'
import { GameRelease } from 'apps/playnite-web/.generated/types.generated'

const Restart_Game_Release_Mutation = gql`
  mutation restartGameRelease($releaseId: String!) {
    restartGameRelease(releaseId: $releaseId) {
      id
    }
  }
`

const useRestartRelease = () => {
  return useMutation<{ restartGameRelease: GameRelease }>(
    Restart_Game_Release_Mutation,
  )
}
export { Restart_Game_Release_Mutation, useRestartRelease }
