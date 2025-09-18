import { gql } from '@apollo/client/core'
import { useMutation } from '@apollo/client/react'
import { merge } from 'lodash-es'
import { User } from '../../../../.generated/types.generated'
import { MeQuery } from './me'

const signOut = gql`
  mutation signOut {
    signOut {
      isAuthenticated
      username
    }
  }
`
const useSignOut = () =>
  useMutation<{ signOut: User }>(signOut, {
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

export { signOut, useSignOut }
