import { gql } from '@apollo/client/core'
import { useSubscription } from '@apollo/client/react'
import type { DomainType } from '../../../server/oid'

const SubscribeEntityUpdatesQuery = gql`
  subscription entityUpdates {
    entityUpdated {
      id
      type
      fields {
        key
        value
        values
      }
    }
  }
`

const useSubscribeEntityUpdates = () =>
  useSubscription<{
    entityUpdated: Array<{
      id: string
      fields: Array<string>
      type: DomainType
    }>
  }>(SubscribeEntityUpdatesQuery)

export { SubscribeEntityUpdatesQuery, useSubscribeEntityUpdates }