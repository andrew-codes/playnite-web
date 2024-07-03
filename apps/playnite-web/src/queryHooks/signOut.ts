import { gql } from '@apollo/client/core/core.cjs'
import { useMutation } from '@apollo/client/react/hooks/hooks.cjs'
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
  useMutation(signOut, {
    update: (cache, mutationResult) => {
      const { signOut } = mutationResult.data
      cache.updateQuery({ query: Me }, (data) => ({
        ...data,
        me: { ...signOut },
      }))
    },
  })

export { signOut, useSignOut }
