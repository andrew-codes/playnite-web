import type { GameReleaseResolvers } from '../../../../../../.generated/types.generated'
import { create } from '../../../../oid'

export const GameRelease: GameReleaseResolvers = {
  id: async (_parent, _arg, _ctx) => {
    return create('GameRelease', _parent.id).toString()
  },
  platform: async (_parent, _arg, _ctx) => {
    return _parent.platformSource
  },
  game: async (_parent, _arg, _ctx) => {
    return _ctx.api.gameRelease.getByName(_parent.name)
  },
  completionStatus: async (_parent, _arg, _ctx) => {
    return _ctx.api.completionStatus.getById(_parent.completionStatusId)
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
    if (_parent.isRunning) {
      return 'running'
    } else if (_parent.isLaunching) {
      return 'launching'
    } else if (_parent.isInstalling) {
      return 'installing'
    } else if (_parent.isInstalled) {
      return 'installed'
    } else if (_parent.isUninstalling) {
      return 'uninstalling'
    }

    return 'not installed'
  },
  features: async (_parent, _arg, _ctx) => {
    return Promise.all(
      (_parent.featureIds ?? []).map((id) => {
        return _ctx.api.feature.getById(id)
      }),
    )
  },
  cover: async (_parent, _arg, _ctx) => {
    return _ctx.api.asset.getByRelation(_parent.id, 'cover')
  },
}
