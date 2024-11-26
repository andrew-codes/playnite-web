import { gql } from '@apollo/client/core/core.cjs'
import { useMutation } from '@apollo/client/react/hooks/hooks.cjs'
import { omit } from 'lodash-es'
import { Claim } from '../../.generated/types.generated'
import { Me } from './me'

const signIn = gql`
  mutation signIn($input: SignInInput) {
    signIn(input: $input) {
      user {
        isAuthenticated
        username
      }
    }
  }
`
const useSignIn = () =>
  useMutation<{ signIn: Claim }>(signIn, {
    update: (cache, mutationResult) => {
      cache.updateQuery({ query: Me }, (data) => ({
        ...data,
        me: { ...omit(mutationResult.data?.signIn.user, 'credential') },
      }))
    },
  })

export { signIn, useSignIn }
