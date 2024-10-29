import type { GameReleaseStateSubscriptionPayloadResolvers } from './../../../../../../.generated/types.generated'
export const GameReleaseStateSubscriptionPayload: GameReleaseStateSubscriptionPayloadResolvers =
  {
    runState: async (parent, _args, _ctx) => {
      return (parent.runState ?? 'installed') as unknown as string
    },
    /* Implement GameReleaseStateSubscriptionPayload resolver logic here */
  }
