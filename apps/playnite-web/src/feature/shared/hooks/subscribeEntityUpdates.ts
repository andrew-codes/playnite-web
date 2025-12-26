import { useSubscription } from '@apollo/client/react'
import type { DomainType } from '../../../server/oid'
import { SubscribeEntityUpdatesQuery } from '../../game/queries'

const useSubscribeEntityUpdates = () =>
  useSubscription<{
    entityUpdated: Array<{
      id: string
      fields: Array<{
        key: string
        value?: string
        values?: Array<string>
      }>
      type: DomainType
    }>
  }>(SubscribeEntityUpdatesQuery)

export { useSubscribeEntityUpdates }
