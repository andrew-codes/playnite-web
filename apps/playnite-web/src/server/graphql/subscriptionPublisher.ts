import { createPubSub } from 'graphql-yoga'
import { DomainType } from '../oid'

export type PubSubChannels = {
  entityUpdated: [
    {
      source: string
      type: DomainType
      id: number
      fields: Array<{
        key: string
        value?: string
        values?: Array<string>
      }>
      playniteId?: string
    },
  ]
  librarySynced: [{ id: number; source: string; type: DomainType }]
}

const subscriptionPublisher = createPubSub<PubSubChannels>()

export { subscriptionPublisher }
