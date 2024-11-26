import type { UserResolvers } from '../../../../../../.generated/types.generated.js'
export const User: UserResolvers = {
  isAuthenticated: async (parent, _args, ctx) => {
    return parent.isAuthenticated ?? false
  },
}
