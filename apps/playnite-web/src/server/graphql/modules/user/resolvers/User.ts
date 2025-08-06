import type { UserResolvers } from '../../../../../../.generated/types.generated.js'
import { create, createNull } from '../../../../oid.js'

export const User: UserResolvers = {
  id: (parent) => {
    return (
      parent.id ? create('User', parent.id) : createNull('User')
    ).toString()
  },
  isAuthenticated: async (parent, _args, ctx) => {
    return parent.isAuthenticated ?? false
  },
  libraries: async (parent, _args, ctx) => {
    if (!parent.libraries) {
      return []
    }

    const libraries = await ctx.db.library.findMany({
      where: {
        id: { in: parent.libraries.map((library) => library.id) },
      },
    })

    return libraries
  },
}
