import { ErrorLike } from '@apollo/client/core'
import { useMutation } from '@apollo/client/react'
import { Claim } from '../../../server/auth'
import { SignUpMutation } from '../queries'
const useRegisterAccount = () =>
  useMutation<{ signUp: Claim }>(SignUpMutation, {
    errorPolicy: 'all',
    onError: (error) => {
      const e = error as ErrorLike & {
        cause: { result: { errors: Array<{ message: string }> } }
      }
      e.message =
        e.cause?.result?.errors?.map((_e) => _e.message).join(', ') || e.message
      console.warn(
        'Error during account registration:',
        JSON.stringify(error, null, 2),
        error.message,
      )
    },
    update: (cache, mutationResult) => {
      if (mutationResult.errors || !mutationResult.data?.signUp.user) {
        return
      }
      cache.modify({
        id: cache.identify({
          __typename: 'User',
          id: mutationResult.data.signUp.user.id,
        }),
        fields: {
          isAuthenticated() {
            return true
          },
        },
      })
    },
  })

export { useRegisterAccount }
