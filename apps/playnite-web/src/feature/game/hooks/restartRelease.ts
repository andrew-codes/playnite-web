import { useMutation } from '@apollo/client/react'
import { Release } from '../../../../.generated/types.generated'
import { RestartReleaseMutation } from '../queries'

const useRestartRelease = () => {
  return useMutation<{ restartRelease: Release }>(RestartReleaseMutation)
}

export { useRestartRelease }
