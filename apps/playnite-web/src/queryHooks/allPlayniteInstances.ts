import { gql } from '@apollo/client/core/core.cjs'
import { useQuery } from '@apollo/client/react/hooks/hooks.cjs'
import { Connection } from '../server/data/types.entities'

const AllPlayniteInstancesQuery = gql`
  query playniteInstances {
    playniteInstances {
      id
      librarySyncState
    }
  }
`

const useAllPlayniteInstances = () => {
  const q = useQuery<{ playniteInstances: Array<Connection> }>(
    AllPlayniteInstancesQuery,
  )

  return q
}

export { AllPlayniteInstancesQuery, useAllPlayniteInstances }
