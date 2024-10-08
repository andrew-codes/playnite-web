import type { UserResolvers } from '../../../../../../.generated/types.generated'
export const User: UserResolvers = {
  isAuthenticated: async (parent, _args, ctx) => {
    return parent.isAuthenticated ?? false
  },
}
