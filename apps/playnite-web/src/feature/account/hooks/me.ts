import { gql } from '@apollo/client/core'
import { useQuery } from '@apollo/client/react'
import { User } from '../../../../.generated/types.generated'

const MeQuery = gql`
  query Me {
    me {
      username
      permission
      isAuthenticated
      libraries {
        id
      }
      settings {
        id
        code
        name
        value
        description
        helperText
        dataType
      }
    }
  }
`

const useMe: () => [useQuery.Result<{ me: User }>] = () => {
  const result = useQuery<{ me: User }>(MeQuery)

  return [result]
}

export { MeQuery, useMe }
