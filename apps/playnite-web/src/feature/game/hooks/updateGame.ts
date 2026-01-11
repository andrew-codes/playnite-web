import { useMutation } from '@apollo/client/react'
import { UpdateGameInput } from '../../../../.generated/types.generated'
import { UpdateGameMutation } from '../queries'

const useUpdateGame = () => {
  return useMutation<
    {
      updateGame: {
        id: string
        coverArt: string | null
        library: { id: string }
      }
    },
    { input: UpdateGameInput }
  >(UpdateGameMutation)
}

export { useUpdateGame }
