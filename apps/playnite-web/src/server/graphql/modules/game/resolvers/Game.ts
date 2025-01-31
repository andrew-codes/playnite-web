import { isEmpty } from 'lodash-es'
import type { GameResolvers } from '../../../../../../.generated/types.generated.js'
import { GameAsset, Release } from '../../../../data/types.entities.js'
import { create } from '../../../../oid.js'

export const Game: GameResolvers = {
  id: async (_parent, _arg, _ctx) => {
    return create('Game', _parent.id).toString()
  },
  name: async (_parent, _arg, _ctx) => {
    return _parent.name
  },
  description: async (_parent, _arg, _ctx) => {
    return _parent.description
  },
  releases: async (_parent, _arg, _ctx) => {
    const results = await Promise.all(
      _parent.releaseIds.map((releaseId) =>
        _ctx.queryApi.execute<Release>({
          entityType: 'Release',
          type: 'ExactMatch',
          field: 'id',
          value: releaseId,
        }),
      ),
    )

    return results
      .filter((result) => !isEmpty(result))
      .map((result) => result?.[0])
      .filter((result): result is Release => result !== null)
  },
  cover: async (_parent, _arg, _ctx) => {
    if (!_parent.cover) {
      return null
    }

    const results = await _ctx.queryApi.execute<GameAsset>({
      entityType: 'GameAsset',
      type: 'ExactMatch',
      field: 'id',
      value: `${_parent.cover.split('\\')[1].split('.')[0]}.webp`,
    })

    return results?.[0] ?? null
  },
}
