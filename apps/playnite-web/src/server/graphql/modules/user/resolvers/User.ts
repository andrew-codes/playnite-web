import type { UserResolvers } from '../../../../../../.generated/types.generated.js'
import Permission from '../../../../../auth/permissions.js'
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
    if (!parent.id) {
      return []
    }

    const libraries = await ctx.db.library.findMany({
      where: {
        User: {
          id: parent.id,
        },
      },
    })

    return libraries
  },

  settings: async (parent, _args, ctx) => {
    if (!parent.id) {
      return []
    }

    return ctx.db.userSetting.findMany({
      where: {
        userId: parent.id,
      },
    })
  },

  permission: async (parent, _args, ctx) => {
    return parent.permission ?? Permission.None
  },
}
