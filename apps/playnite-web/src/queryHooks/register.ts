import { gql } from '@apollo/client/core/core.cjs'
import { useMutation } from '@apollo/client/react/hooks/hooks.cjs'
import { Claim } from '../server/auth'
import { Me } from './me'

const signUp = gql`
  mutation signUp($input: SignUpInput!) {
    signUp(input: $input) {
      user {
        id
        username
        isAuthenticated
      }
    }
  }
`
const useRegisterAccount = () =>
  useMutation<{ signUp: Claim }>(signUp, {
    update: (cache, mutationResult) => {
      cache.updateQuery({ query: Me }, (data) => ({
        ...data,
        me: mutationResult.data?.signUp.user,
      }))
    },
  })

export { signUp, useRegisterAccount }
