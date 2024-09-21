import type { GameResolvers } from '../../../../../../.generated/types.generated'
import { create } from '../../../../oid'
import { unknownPlatform } from '../../platform/api'

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
    const releases = await Promise.all(
      _parent.releases.map(async (releaseId) =>
        _ctx.api.gameRelease.getById(releaseId),
      ),
    )

    return _ctx.api.game
      .toGameReleases(releases)
      .filter(
        (gameRelease) => gameRelease.platformSource.id !== unknownPlatform.id,
      )
  },
  cover: async (_parent, _arg, _ctx) => {
    return _parent.releases[0]
      ? ((await _ctx.api.asset.getByRelation(_parent.releases[0], 'cover')) ??
          null)
      : null
  },
}
