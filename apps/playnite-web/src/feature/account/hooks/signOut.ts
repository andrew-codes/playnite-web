import { useMutation } from '@apollo/client/react'
import { merge } from 'lodash'
import { User } from '../../../../.generated/types.generated'
import { MeQuery, SignOutMutation } from '../queries'
const useSignOut = () =>
  useMutation<{ signOut: User }>(SignOutMutation, {
    update: (cache, mutationResult) => {
      cache.updateQuery({ query: MeQuery }, (data: any) =>
        merge({}, data ?? {}, {
          me: {
            username: null,
            isAuthenticated: false,
          },
        }),
      )
    },
  })

export { useSignOut }
