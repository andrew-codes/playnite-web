import type { SubscriptionResolvers } from './../../../../../../../.generated/types.generated'
export const releaseActivationStateChanged: NonNullable<
  SubscriptionResolvers['releaseActivationStateChanged']
> = {
  subscribe: async (_parent, _arg, _ctx) => {
    return _ctx.subscriptionPublisher.subscribe('gameActivationStateChanged')
  },
  resolve: (payload) => payload,
}
