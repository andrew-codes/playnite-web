import type { GameReleaseResolvers } from '../../../../../../.generated/types.generated.js'
import {
  CompletionStatus,
  GameAsset,
  GameFeature,
  GameSource,
  Platform,
} from '../../../../data/types.entities.js'
import { create, createNull } from '../../../../oid.js'

export const GameRelease: GameReleaseResolvers = {
  id: async (_parent, _arg, _ctx) => {
    return create('GameRelease', _parent.id).toString()
  },
  platform: async (_parent, _arg, _ctx) => {
    const results = (await _ctx.queryApi.execute<Platform>({
      entityType: 'Platform',
      type: 'ExactMatch',
      field: 'id',
      value: _parent.platformId,
    })) as Array<Platform>

    return results[0]
  },
  completionStatus: async (_parent, _arg, _ctx) => {
    if (
      _parent.completionStatusId === null ||
      _parent.completionStatusId === '00000000-0000-0000-0000-000000000000'
    ) {
      return {
        _type: 'CompletionStatus',
        id: createNull('CompletionStatus').toString(),
        name: 'Backlog',
      }
    }

    const results = (await _ctx.queryApi.execute<CompletionStatus>({
      entityType: 'CompletionStatus',
      type: 'ExactMatch',
      field: 'id',
      value: _parent.completionStatusId,
    })) as Array<CompletionStatus>

    return results[0]
  },
  releaseDate: async (_parent, _arg, _ctx) => {
    return _parent.releaseDate
      ? new Date(
          _parent.releaseDate.year,
          _parent.releaseDate.month - 1,
          _parent.releaseDate.day,
        )
      : null
  },
  recentActivity: async (_parent, _arg, _ctx) => {
    return _parent.recentActivity ? new Date(_parent.recentActivity) : null
  },
  runState: async (_parent, _arg, _ctx) => {
    return _parent.runState?.id ?? 'installed'
  },
  features: async (_parent, _arg, _ctx) => {
    const results = await Promise.all(
      _parent.featureIds.map((featureId) =>
        _ctx.queryApi.execute<GameFeature>({
          entityType: 'GameFeature',
          type: 'ExactMatch',
          field: 'id',
          value: featureId,
        }),
      ),
    )

    return results
      .filter((result) => result !== null)
      .map((result) => result[0])
  },
  cover: async (_parent, _arg, _ctx) => {
    if (!_parent.coverImage) {
      return null
    }

    const results = await _ctx.queryApi.execute<GameAsset>({
      type: 'ExactMatch',
      entityType: 'GameAsset',
      field: 'id',
      value: `${_parent.coverImage.split('\\')[1].split('.')[0]}.webp`,
    })

    return results?.[0]
  },
  source: async (_parent, _arg, _ctx) => {
    const results = (await _ctx.queryApi.execute<GameSource>({
      entityType: 'GameSource',
      type: 'ExactMatch',
      field: 'id',
      value: _parent.sourceId,
    })) as Array<GameSource>

    return results?.[0]
  },
  game: async (_parent, _arg, _ctx) => {
    const results = (await _ctx.queryApi.execute({
      entityType: 'Game',
      type: 'RelationMatch',
      field: 'releaseIds',
      relationType: 'Release',
      filterItem: {
        entityType: 'Release',
        type: 'ExactMatch',
        field: 'id',
        value: _parent.id,
      },
    })) as Array<any>

    return results?.[0]
  },
  playniteWebRunState: async (_parent, _arg, _ctx) => {
    return _parent.playniteWebRunState ?? null
  },
}
