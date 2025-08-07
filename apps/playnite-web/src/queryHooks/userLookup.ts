import { gql } from '@apollo/client/core/core.cjs'
import { useQuery } from '@apollo/client/react/hooks/hooks.cjs'
import { User } from '../../.generated/types.generated'

const UserLookup = gql`
  query UserLookup($username: String!) {
    lookupUser(username: $username) {
      id
      username
      libraries {
        id
        name
      }
    }
  }
`

const useUserLookup = (username: string) =>
  useQuery<{ lookupUser: User }>(UserLookup, { variables: { username } })

export { UserLookup, useUserLookup }
