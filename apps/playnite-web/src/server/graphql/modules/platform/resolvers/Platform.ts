import type { PlatformResolvers } from '../../../../../../.generated/types.generated'
import { create } from '../../../../oid'
import { resolve } from '../../../../resolveAssets'

export const Platform: PlatformResolvers = {
  id: async (_parent, _arg, _ctx) => {
    return create('Platform', _parent.id).toString()
  },
  icon: async (_parent, _arg, _ctx) => {
    if (!_parent.name) {
      return null
    }

    return resolve(
      `/assets/platforms/${_parent.name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[.,!?<>/|\\:$&*(){}[\]"';@#`~]|--+/g, '')}.webp`,
    )
  },
  games: async (_parent, _arg, _ctx) => {
    return _ctx.db.game.findMany({
      where: {
        Releases: {
          some: {
            Source: {
              Platform: {
                id: _parent.id,
              },
            },
          },
        },
      },
      orderBy: {
        title: 'asc',
      },
    })
  },
}
