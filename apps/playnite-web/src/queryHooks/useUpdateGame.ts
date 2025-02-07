import { gql } from '@apollo/client/core/core.cjs'
import { useMutation } from '@apollo/client/react/hooks/hooks.cjs'

const UpdateGame = gql`
  mutation updateGame($id: String!, $input: UpdateGameInput!) {
    updateGame(id: $id, input: $input) {
      success
    }
  }
`

const useUpdateGame = () => {
  return useMutation<{ success: boolean }>(UpdateGame)
}
export { UpdateGame, useUpdateGame }
