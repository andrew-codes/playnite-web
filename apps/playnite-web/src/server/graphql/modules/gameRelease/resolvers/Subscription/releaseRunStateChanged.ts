import type { SubscriptionResolvers } from './../../../../../../../.generated/types.generated.js'
export const releaseRunStateChanged: NonNullable<
  SubscriptionResolvers['releaseRunStateChanged']
> = {
  subscribe: async (_parent, _arg, _ctx) => {
    return _ctx.subscriptionPublisher.subscribe('releaseRunStateChanged')
  },
  resolve: (payload) => payload,
}
