import DataLoader from 'dataloader'
import createDebugger from 'debug'
import _ from 'lodash'
import { GameReleaseDbEntity } from '../../../data/types'
import { autoBind, type DomainApi } from '../../../Domain'
import {
  GameEntity,
  GameReleaseEntity,
  PlatformSourceEntity,
} from '../../../resolverTypes'
import { unknownPlatform } from '../../platform/api'

const debug = createDebugger('playnite-web/graphql/game/api')

const { groupBy, keyBy, merge, omit, toLower } = _

const platformDisplays = {
  pc: { matcher: /PC/ },
  osx: { matcher: /Macintosh/ },
  linux: { matcher: /Linux/ },
  ps5: { matcher: /PlayStation 5/ },
  ps4: { matcher: /PlayStation 4/ },
  ps3: { matcher: /PlayStation 3/ },
  ps2: { matcher: /PlayStation 2/ },
  ps1: { matcher: /PlayStation/ },
}

const sortOrder = [
  platformDisplays.pc,
  platformDisplays.osx,
  platformDisplays.linux,
  platformDisplays.ps5,
  platformDisplays.ps4,
  platformDisplays.ps3,
  platformDisplays.ps2,
  platformDisplays.ps1,
]

const getPlatforms = (
  gameRelease: Omit<GameReleaseDbEntity, '_id'> | GameReleaseEntity,
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
    case 'Ubisoft Connect':
    case 'Battle.net':
    case 'EA app':
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
  gameReleases: Array<Omit<GameReleaseDbEntity, '_id'>>,
): Array<GameReleaseEntity> => {
  const releasesGroupedBySource = groupBy(gameReleases, 'source.name')

  return Object.values(releasesGroupedBySource)
    .flatMap((releases) =>
      releases.map((release, index) =>
        omit(
          merge({}, release, {
            platformSource: merge(
              {},
              getPlatforms(release)[index] ?? unknownPlatform,
              { source: release.source.name },
            ),
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

function create(this: DomainApi) {
  const loader = new DataLoader<string, GameEntity>(async (ids) => {
    const results = keyBy(
      await (
        await this.db()
      )
        .collection<GameEntity>('consolidated-games')
        .find({ id: { $in: ids } })
        .toArray(),
      'id',
    )

    return ids.map((id) =>
      results[id] ? omit(results[id], '_id') : null,
    ) as Array<GameEntity>
  })

  return autoBind(this, {
    async getById(this: DomainApi, id: string) {
      return loader.load(id)
    },
    async getBy(this: DomainApi, query: any) {
      return await (await this.db())
        .collection<GameEntity>('consolidated-games')
        .find(query)
        .toArray()
    },
    async getAll(this: DomainApi) {
      return await (await this.db())
        .collection<GameEntity>('consolidated-games')
        .find()
        .toArray()
    },
    toGameReleases,
  })
}

export default create
