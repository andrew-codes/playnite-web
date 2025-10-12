import { useMutation } from '@apollo/client/react'
import { ReleaseInput } from '../../../../.generated/types.generated'
import { UpdateReleaseMutation } from '../queries'

const useUpdateRelease = () => {
  return useMutation<
    {
      updateRelease: {
        id: string
        game: { id: string; library: { id: string } }
      }
    },
    { release: ReleaseInput }
  >(UpdateReleaseMutation)
}
export { useUpdateRelease }
