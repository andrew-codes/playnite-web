import { useQuery } from '@apollo/client/react'
import { User } from '../../../../.generated/types.generated'
import { UserLookupQuery } from '../queries'

const useUserLookup = (username: string) =>
  useQuery<{ lookupUser: User }>(UserLookupQuery, { variables: { username } })

export { useUserLookup }
