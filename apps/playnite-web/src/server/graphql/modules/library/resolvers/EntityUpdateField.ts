import { fromString, hasIdentity } from '../../../../oid'
import type { EntityUpdateFieldResolvers } from './../../../../../../.generated/types.generated'
export const EntityUpdateField: EntityUpdateFieldResolvers = {
  playniteId: async (parent, _, ctx) => {
    if (!parent.value) {
      return null
    }
    const id = fromString(parent.value)
    if (!hasIdentity(id)) {
      return null
    }
    switch (parent.key) {
      case 'completionStatus':
        return (
          await ctx.db.completionStatus.findUnique({
            where: { id: id.id },
            select: { playniteId: true },
          })
        )?.playniteId
      case 'features':
        return (
          await ctx.db.feature.findUnique({
            where: { id: id.id },
            select: { playniteId: true },
          })
        )?.playniteId
      case 'tags':
        return (
          await ctx.db.tag.findUnique({
            where: { id: id.id },
            select: { playniteId: true },
          })
        )?.playniteId
      case 'platform':
        return (
          await ctx.db.platform.findUnique({
            where: { id: id.id },
            select: { playniteId: true },
          })
        )?.playniteId
      case 'source':
        return (
          await ctx.db.source.findUnique({
            where: { id: id.id },
            select: { playniteId: true },
          })
        )?.playniteId
    }
  },
  playniteIds: async (parent, _, ctx) => {
    return (
      await Promise.all(
        parent.values
          ? parent.values.map(async (value) => {
              const id = fromString(value)
              if (!hasIdentity(id)) {
                return null
              }
              switch (parent.key) {
                case 'completionStatus':
                  return (
                    await ctx.db.completionStatus.findUnique({
                      where: { id: id.id },
                      select: { playniteId: true },
                    })
                  )?.playniteId
                case 'features':
                  return (
                    await ctx.db.feature.findUnique({
                      where: { id: id.id },
                      select: { playniteId: true },
                    })
                  )?.playniteId
                case 'tags':
                  return (
                    await ctx.db.tag.findUnique({
                      where: { id: id.id },
                      select: { playniteId: true },
                    })
                  )?.playniteId
                case 'platform':
                  return (
                    await ctx.db.platform.findUnique({
                      where: { id: id.id },
                      select: { playniteId: true },
                    })
                  )?.playniteId
                case 'source':
                  return (
                    await ctx.db.source.findUnique({
                      where: { id: id.id },
                      select: { playniteId: true },
                    })
                  )?.playniteId

                default:
                  return null
              }
            })
          : ([] as Array<string>),
      )
    ).filter(Boolean) as Array<string>
  },
  key: (parent) => parent.key,
  value: (parent) => parent.value,
  values: (parent) => parent.values ?? [],
}
