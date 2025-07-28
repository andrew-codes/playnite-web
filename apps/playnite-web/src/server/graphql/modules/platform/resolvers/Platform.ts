import type { PlatformResolvers } from '../../../../../../.generated/types.generated.js'
import { create } from '../../../../oid.js'

export const Platform: PlatformResolvers = {
  id: async (_parent, _arg, _ctx) => {
    return create('Platform', _parent.id).toString()
  },
  icon: async (_parent, _arg, _ctx) => {
    if (!_parent.iconId) {
      return null
    }
    return _ctx.db.asset.findUnique({
      where: {
        id: _parent.iconId,
      },
    })
  },
  games: async (_parent, _arg, _ctx) => {
    return _ctx.db.game.findMany({
      where: {
        Releases: {
          some: {
            Platform: {
              id: _parent.id,
            },
          },
        },
      },
      orderBy: {
        PrimaryRelease: {
          title: 'asc',
        },
      },
    })
  },
}
