import type { SubscriptionResolvers } from './../../../../../../../.generated/types.generated'
export const playniteWebRunStateUpdated: NonNullable<
  SubscriptionResolvers['playniteWebRunStateUpdated']
> = {
  subscribe: async (_parent, _arg, _ctx) => {
    return _ctx.subscriptionPublisher.subscribe('playniteWebRunStateUpdated')
  },
  resolve: (payload) => payload,
}
