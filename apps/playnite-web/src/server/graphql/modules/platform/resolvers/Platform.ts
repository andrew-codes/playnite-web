import type { PlatformResolvers } from '../../../../../../.generated/types.generated.js'
import { GameAsset, Release } from '../../../../data/types.entities.js'
import { create } from '../../../../oid.js'

export const Platform: PlatformResolvers = {
  id: async (_parent, _arg, _ctx) => {
    return create('Platform', _parent.id).toString()
  },
  name: async (_parent, _arg, _ctx) => {
    return _parent.name
  },
  releases: async (_parent, _arg, _ctx) => {
    const results = await _ctx.queryApi.execute<Release>({
      entityType: 'Release',
      type: 'ExactMatch',
      field: 'platformId',
      value: _parent.id,
    })

    return results ?? []
  },
  icon: async (_parent, _arg, _ctx) => {
    if (!_parent.icon) {
      return null
    }

    const results = await _ctx.queryApi.execute<GameAsset>({
      entityType: 'GameAsset',
      type: 'ExactMatch',
      field: 'id',
      value: `${_parent.icon.split('\\')[1].split('.')[0]}.webp`,
    })

    return results?.[0] ?? null
  },
  isConsole: async (_parent, _arg, _ctx) => {
    return !/(PC)|(Macintosh)|(Linux)/.test(_parent.name)
  },
}
