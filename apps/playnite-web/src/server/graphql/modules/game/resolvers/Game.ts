import { isEmpty } from 'lodash-es'
import type { GameResolvers } from '../../../../../../.generated/types.generated.js'
import {
  CompletionStatus,
  GameAsset,
  Release,
} from '../../../../data/types.entities.js'
import { create, createNull } from '../../../../oid.js'
import { completionStatusSortOrder } from '../../completionStatus/resolvers/CompletionStatus.js'

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

  completionStatus: async (_parent, _arg, _ctx) => {
    const releases = (
      await Promise.all(
        _parent.releaseIds.map((releaseId) =>
          _ctx.queryApi.execute<Release>({
            entityType: 'Release',
            type: 'ExactMatch',
            field: 'id',
            value: releaseId,
          }),
        ),
      )
    )
      .filter((result) => result !== null)
      .map((result) => result[0])

    const completionStatusIds = releases.map(
      (release) => release.completionStatusId,
    )

    return (
      (
        await Promise.all(
          completionStatusIds.map((id) =>
            _ctx.queryApi.execute<CompletionStatus>({
              entityType: 'CompletionStatus',
              type: 'ExactMatch',
              field: 'id',
              value: id,
            }),
          ),
        )
      )
        .filter((result) => result !== null)
        .map((result) => result[0])
        .sort((a, b) => {
          const aSort = completionStatusSortOrder.findIndex((p) =>
            p.test(a.name),
          )
          const bSort = completionStatusSortOrder.findIndex((p) =>
            p.test(b.name),
          )
          if (aSort > bSort) {
            return 1
          }
          if (aSort < bSort) {
            return -1
          }
          return 0
        })?.[0] ?? { id: createNull('CompletionStatus'), name: 'Unknown' }
    )
  },
}
