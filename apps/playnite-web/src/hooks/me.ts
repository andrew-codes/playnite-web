import { gql } from '@apollo/client/core'
import { QueryResult, useQuery } from '@apollo/client/react'
import { User } from '../../.generated/types.generated'
import { PermissionValue, userHasPermission } from '../auth/permissions'

const Me = gql`
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

const useMe: () => [
  QueryResult<{ me: User }>,
  hasPermission: (target: PermissionValue) => boolean,
] = () => {
  const result = useQuery<{ me: User }>(Me)

  const hasPermission = (target: PermissionValue) => {
    return userHasPermission(result.data?.me, target)
  }

  return [result, hasPermission]
}

export { Me, useMe }
