import { gql } from '@apollo/client/core'
import { useMutation } from '@apollo/client/react'
import { Release } from '../../.generated/types.generated'

const RestartReleaseMutation = gql`
  mutation restartRelease($id: String!) {
    restartRelease(id: $id) {
      id
    }
  }
`

const useRestartRelease = () => {
  return useMutation<{ restartRelease: Release }>(RestartReleaseMutation)
}
export { RestartReleaseMutation, useRestartRelease }
