import { useMutation } from '@apollo/client/react'
import { merge } from 'lodash'
import { Claim } from '../../../../.generated/types.generated'
import { MeQuery, SignInMutation } from '../queries'
const useSignIn = () =>
  useMutation<{ signIn: Claim }>(SignInMutation, {
    update: (cache, mutationResult) => {
      cache.updateQuery({ query: MeQuery }, (data: any) =>
        merge({}, data ?? {}, {
          me: mutationResult.data?.signIn.user,
        }),
      )
    },
  })

export { useSignIn }
