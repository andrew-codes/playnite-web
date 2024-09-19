import createDebugger from 'debug'
import _ from 'lodash'
import type { GameResolvers } from '../../../../../../.generated/types.generated'
import { create } from '../../../../oid'
import { GameReleaseDbEntity } from '../../../data/types'
import { GameReleaseEntity, PlatformSourceEntity } from '../../../resolverTypes'
import { unknownPlatform } from '../../platform/api'

const debug = createDebugger('playnite-web/graphql/game/resolver')

const { groupBy, merge, omit, toLower } = _

const platformDisplays = {
  pc: { matcher: /PC/ },
  osx: { matcher: /Macintosh/ },
  linux: { matcher: /Linux/ },
  ps5: { matcher: /PlayStation 5/ },
  ps4: { matcher: /PlayStation 4/ },
  ps3: { matcher: /PlayStation 3/ },
  p2: { matcher: /PlayStation 2/ },
  ps1: { matcher: /PlayStation/ },
}

const sortOrder = [
  platformDisplays.pc,
  platformDisplays.osx,
  platformDisplays.linux,
  platformDisplays.ps5,
  platformDisplays.ps4,
  platformDisplays.ps3,
  platformDisplays.p2,
  platformDisplays.ps1,
]

const getPlatforms = (
  gameRelease: GameReleaseDbEntity | GameReleaseEntity,
): Array<PlatformSourceEntity> => {
  if (!gameRelease.source?.name) {
    debug(
      `Expecting game release (${gameRelease.name}) to have a source name, but it did not have one. Please check this game release in Playnite and ensure it has a source name.`,
      gameRelease,
    )

    return []
  }
  switch (gameRelease.source.name) {
    case 'PlayStation':
      return gameRelease.platforms.filter((platform) =>
        toLower(platform.name).includes('playstation'),
      )
    case 'Xbox':
      return gameRelease.platforms.filter((platform) =>
        toLower(platform.name).includes('xbox'),
      )
    case 'Steam':
    case 'Epic':
    case 'GOG':
    case 'Origin':
    case 'Uplay':
    case 'Battle.net':
    case 'EA':
      return gameRelease.platforms
        .filter(
          (platform) =>
            platform.name === 'PC (Windows)' ||
            platform.name === 'Linux' ||
            platform.name === 'Macintosh',
        )
        .sort((a, b) => {
          const aSort = sortOrder.findIndex((p) => p.matcher.test(a.name))
          const bSort = sortOrder.findIndex((p) => p.matcher.test(b.name))
          if (aSort > bSort) {
            return 1
          }
          if (aSort < bSort) {
            return -1
          }
          return 0
        })
    case 'Nintendo':
      return gameRelease.platforms.filter((platform) =>
        toLower(platform.name).includes('nintendo'),
      )
    default:
      return []
  }
}

const toGameReleases = (
  gameReleases: Array<GameReleaseDbEntity>,
): Array<GameReleaseEntity> => {
  const releasesGroupedBySource = groupBy(gameReleases, 'source.name')

  return Object.values(releasesGroupedBySource)
    .flatMap((releases) =>
      releases.map((release, index) =>
        omit(
          merge({}, release, {
            platformSource: getPlatforms(release)[index] ?? unknownPlatform,
          }),
          '_id',
        ),
      ),
    )
    .sort((a, b) => {
      const aSort = sortOrder.findIndex((p) =>
        p.matcher.test(a.platformSource.name),
      )
      const bSort = sortOrder.findIndex((p) =>
        p.matcher.test(b.platformSource.name),
      )
      if (aSort > bSort) {
        return 1
      }
      if (aSort < bSort) {
        return -1
      }
      return 0
    }) as Array<GameReleaseEntity>
}

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

    return toGameReleases(releases).filter(
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
