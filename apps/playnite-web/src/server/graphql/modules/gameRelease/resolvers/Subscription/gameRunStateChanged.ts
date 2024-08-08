import type { SubscriptionResolvers } from '../../../../../../../.generated/types.generated'

export const gameRunStateChanged: NonNullable<
  SubscriptionResolvers['gameRunStateChanged']
> = {
  subscribe: async (_parent, _arg, _ctx) => {
    return _ctx.subscriptionPublisher.subscribe('gameRunStateChanged')
  },
}
