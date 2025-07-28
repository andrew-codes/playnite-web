import type { UserResolvers } from '../../../../../../.generated/types.generated.js'
import { create, createNull } from '../../../../oid.js'

export const User: UserResolvers = {
  id: (parent) => {
    console.debug(parent.id)
    return (
      parent.id ? create('User', parent.id) : createNull('User')
    ).toString()
  },
  isAuthenticated: async (parent, _args, ctx) => {
    return parent.isAuthenticated ?? false
  },
}
