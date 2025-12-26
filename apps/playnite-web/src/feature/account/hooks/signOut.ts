import { useMutation } from '@apollo/client/react'
import { redirect } from 'next/navigation'
import { User } from '../../../../.generated/types.generated'
import { MeQuery, SignOutMutation } from '../queries'
const useSignOut = () => {
  const [mutation] = useMutation<{ signOut: User }>(SignOutMutation, {
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
          libraries: [],
          settings: [],
        },
      }))
    },
  })

  return [
    async () => {
      await mutation()
      redirect('/')
    },
  ] as const
}

export { useSignOut }
