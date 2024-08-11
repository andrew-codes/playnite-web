import { gql } from '@apollo/client/core/core.cjs'
import { useQuery } from '@apollo/client/react/hooks/hooks.cjs'
import { User } from '../../.generated/types.generated'

const Me = gql`
  query Me {
    me {
      username
      isAuthenticated
    }
  }
`

const useMe = () => useQuery<{ me: User }>(Me)

export { Me, useMe }
