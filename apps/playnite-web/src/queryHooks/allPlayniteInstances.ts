import { gql } from '@apollo/client/core/core.cjs'
import { useQuery } from '@apollo/client/react/hooks/hooks.cjs'
import { isEmpty } from 'lodash-es'
import { useEffect } from 'react'
import { Connection } from '../server/data/types.entities'
import { subscribePlayniteLibrarySyncUpdated } from './subscribePlayniteLibrarySyncUpdated'

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

  const { data } = subscribePlayniteLibrarySyncUpdated()
  useEffect(() => {
    if (!isEmpty(data?.id)) {
      q.refetch()
    }
  }, [data?.id])

  return q
}

export { AllPlayniteInstancesQuery, useAllPlayniteInstances }
