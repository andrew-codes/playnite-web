import { createPubSub } from 'graphql-yoga'

export type PubSubChannels = {
  gameRunStateChanged: [
    {
      id: string
      gameId: string
      runState: string
      processId: string
    },
  ]
}

const subscriptionPublisher = createPubSub<PubSubChannels>()

export { subscriptionPublisher }
