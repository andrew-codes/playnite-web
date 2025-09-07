import type { SubscriptionResolvers } from './../../../../../../../.generated/types.generated'
export const librarySynced: NonNullable<
  SubscriptionResolvers['librarySynced']
> = {
  subscribe: async (_parent, _arg, _ctx) => {
    return _ctx.subscriptionPublisher.subscribe('librarySynced')
  },
  resolve: (payload) => (Array.isArray(payload) ? payload : [payload]),
}
