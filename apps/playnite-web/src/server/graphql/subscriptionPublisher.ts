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
  gameActivationStateChanged: [
    { active: boolean | null | undefined; restarted?: boolean },
  ]
}

const subscriptionPublisher = createPubSub<PubSubChannels>()

export { subscriptionPublisher }
