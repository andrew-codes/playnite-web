import { gql } from '@apollo/client/core/core.cjs'
import { useQuery } from '@apollo/client/react/hooks/hooks.cjs'

const Me = gql`
  query Me {
    me {
      username
      isAuthenticated
    }
  }
`

const useMe = () => useQuery(Me)

export { Me, useMe }
