import { gql } from '@apollo/client/core'
import { useQuery } from '@apollo/client/react'
import { User } from '../../../../.generated/types.generated'

const UserLookupQuery = gql`
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
  useQuery<{ lookupUser: User }>(UserLookupQuery, { variables: { username } })

export { UserLookupQuery, useUserLookup }
