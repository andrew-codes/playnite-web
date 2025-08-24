import { gql } from '@apollo/client/core'
import { useMutation } from '@apollo/client/react'
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
    errorPolicy: 'all',
    onError: (error) => {
      error.message =
        error.cause?.result?.errors?.map((e) => e.message).join(', ') ||
        error.message
      console.warn(
        'Error during account registration:',
        JSON.stringify(error, null, 2),
        error.message,
      )
    },
    update: (cache, mutationResult) => {
      cache.updateQuery({ query: Me }, (data: any) => ({
        ...data,
        me: mutationResult.data?.signUp.user,
      }))
    },
  })

export { signUp, useRegisterAccount }
