import { gql } from '@apollo/client/core/core.cjs'
import { useMutation } from '@apollo/client/react/hooks/hooks.cjs'
import { User } from '../../.generated/types.generated'
import { Me } from './me'

const signOut = gql`
  mutation signOut {
    signOut {
      isAuthenticated
      username
    }
  }
`
const useSignOut = () =>
  useMutation<{ signOut: User }>(signOut, {
    update: (cache, mutationResult) => {
      cache.updateQuery({ query: Me }, (data) => ({
        ...data,
        me: {
          username: null,
          isAuthenticated: false,
        },
      }))
    },
  })

export { signOut, useSignOut }
