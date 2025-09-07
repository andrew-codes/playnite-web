import { create } from '../../../../oid'
import type { SourceResolvers } from './../../../../../../.generated/types.generated'

export const Source: SourceResolvers = {
  id: async (parent, _args, _ctx) => {
    return create('Source', parent.id).toString()
  },
  releases: async (parent, _args, ctx) => {
    const releases = await ctx.db.release.findMany({
      where: {
        sourceId: parent.id,
      },
      orderBy: {
        title: 'asc',
      },
    })
    return releases
  },
}
