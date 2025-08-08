import { gql } from '@apollo/client/core/core.cjs'
import { useMutation } from '@apollo/client/react/hooks/hooks.cjs'

const UpdateRelease = gql`
  mutation updateGameRelease(
    $releaseId: String!
    $input: UpdateGameReleaseInput!
  ) {
    updateGameRelease(releaseId: $releaseId, input: $input) {
      success
    }
  }
`

const useUpdateRelease = () => {
  return useMutation<{ success: boolean }>(UpdateRelease)
}
export { UpdateRelease, useUpdateRelease }
