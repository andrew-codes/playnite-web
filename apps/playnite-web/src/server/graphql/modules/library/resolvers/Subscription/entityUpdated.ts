import type { SubscriptionResolvers } from './../../../../../../../.generated/types.generated'

export const entityUpdated: NonNullable<
  SubscriptionResolvers['entityUpdated']
> = {
  subscribe: async (_parent, _arg, _ctx) => {
    return _ctx.subscriptionPublisher.subscribe('entityUpdated')
  },
  resolve: (payload) => Array.isArray(payload) ? payload : [payload],
}
