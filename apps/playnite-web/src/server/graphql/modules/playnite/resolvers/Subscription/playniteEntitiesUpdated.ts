import type { SubscriptionResolvers } from './../../../../../../../.generated/types.generated'
export const playniteEntitiesUpdated: NonNullable<
  SubscriptionResolvers['playniteEntitiesUpdated']
> = {
  subscribe: async (_parent, _arg, _ctx) => {
    return _ctx.subscriptionPublisher.subscribe('playniteEntitiesUpdated')
  },
  resolve: (payload) => payload,
}
