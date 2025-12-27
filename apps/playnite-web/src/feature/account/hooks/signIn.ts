import { useMutation } from '@apollo/client/react'
import { merge } from 'lodash-es'
import { Claim } from '../../../../.generated/types.generated'
import Permission from '../../authorization/permissions'
import { MeQuery, SignInMutation } from '../queries'

const useSignIn = () =>
  useMutation<{ signIn: Claim }>(SignInMutation, {
    update: (cache, mutationResult) => {
      const me = mutationResult.data?.signIn.user
      if (!me) {
        return
      }

      cache.modify({
        id: cache.identify({ __typename: 'User', id: me.id }),
        fields: {
          isAuthenticated() {
            return true
          },
        },
      })
      cache.updateQuery({ query: MeQuery }, () => ({
        me: merge({}, me, {
          permission: Permission.Read,
          libraries: [],
          settings: mutationResult.data?.signIn.user.settings || [],
        }),
      }))
    },
  })

export { useSignIn }
