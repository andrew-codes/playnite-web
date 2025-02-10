import { createPubSub } from 'graphql-yoga'

export type PubSubChannels = {
  releaseRunStateChanged: [
    {
      id: string
      gameId: string
      runState: string
      processId: string | null
    },
  ]
  playniteWebRunStateUpdated: [
    {
      id: string
      runState: string
    },
  ]
  playniteEntitiesUpdated: [
    Array<{
      type: string
      id: string
    }>,
  ]
}

const subscriptionPublisher = createPubSub<PubSubChannels>()

export { subscriptionPublisher }
