import { useQuery } from '@apollo/client/react'
import { User } from '../../../../.generated/types.generated'
import { MeQuery } from '../queries'

const useMe: () => [useQuery.Result<{ me: User }>] = () => {
  const result = useQuery<{ me: User }>(MeQuery)

  return [result]
}

export { MeQuery, useMe }
