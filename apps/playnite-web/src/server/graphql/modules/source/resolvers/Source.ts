import type { SourceResolvers } from './../../../../../../.generated/types.generated.js'
export const Source: SourceResolvers = {
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
