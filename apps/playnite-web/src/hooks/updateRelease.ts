import { gql } from '@apollo/client/core/core.cjs'
import { useMutation } from '@apollo/client/react/hooks/hooks.cjs'
import { ReleaseInput } from 'apps/playnite-web/.generated/types.generated'

const UpdateRelease = gql`
  mutation updateRelease($release: ReleaseInput!) {
    updateRelease(release: $release) {
      id
    }
  }
`

const useUpdateRelease = () => {
  return useMutation<{ id: string }, { release: ReleaseInput }>(UpdateRelease)
}
export { UpdateRelease, useUpdateRelease }
