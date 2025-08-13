import { createPubSub } from 'graphql-yoga'

export type PubSubChannels = {
  entityUpdated: [
    {
      source: string
      updated: Array<{
        type: string
        id: number
      }>
      removed: Array<{
        type: string
        id: number
      }>
    },
  ]
  librarySynced: [{ id: number }]
}

const subscriptionPublisher = createPubSub<PubSubChannels>()

export { subscriptionPublisher }
