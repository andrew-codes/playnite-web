import { useMutation } from '@apollo/client/react'
import { User } from '../../../../.generated/types.generated'
import { MeQuery, SignOutMutation } from '../queries'
const useSignOut = () =>
  useMutation<{ signOut: User }>(SignOutMutation, {
    update: (cache, mutationResult) => {
      const me = mutationResult.data?.signOut
      if (!me) {
        return
      }
      cache.modify({
        id: cache.identify({ __typename: 'User', id: me.id }),
        fields: {
          isAuthenticated() {
            return false
          },
        },
      })
      cache.updateQuery({ query: MeQuery }, () => ({
        me: {
          id: 'User:NULL',
          isAuthenticated: false,
          username: 'Unknown',
          permission: 0,
        },
      }))
    },
  })

export { useSignOut }
