import DataLoader from 'dataloader'
import _ from 'lodash'
import { fromString } from '../../../../oid'
import { GameReleaseDbEntity } from '../../../data/types'
import { autoBind, type DomainApi } from '../../../Domain'
import {
  GameEntity,
  GameReleaseEntity,
  PlatformSourceEntity,
} from '../../../resolverTypes'

const { groupBy, merge, omit, toLower } = _

const platformDisplays = {
  pc: { matcher: /PC/ },
  osx: { matcher: /Macintosh/ },
  linux: { matcher: /Linux/ },
  ps5: { matcher: /PlayStation 5/ },
  ps4: { matcher: /PlayStation 4/ },
  ps3: { matcher: /PlayStation 3/ },
}

const sortOrder = [
  platformDisplays.pc,
  platformDisplays.osx,
  platformDisplays.linux,
  platformDisplays.ps5,
  platformDisplays.ps4,
  platformDisplays.ps3,
]

const getPlatforms = (
  gameRelease: GameReleaseDbEntity | GameReleaseEntity,
): Array<PlatformSourceEntity> => {
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
      if (gameRelease.name === 'Rise of the Tomb Raider') {
        console.log(gameRelease.platforms)
      }
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

const unknownPlatform = {
  id: '00000000-0000-0000-0000-000000000000',
  name: 'Unknown',
}

const toGameEntity = (
  gameReleases: Array<GameReleaseDbEntity | GameReleaseEntity>,
): GameEntity => {
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
    }) as GameEntity
}

function create(this: DomainApi) {
  const loader = new DataLoader<string, GameEntity>(async (ids) => {
    const gameReleaseIds = ids.map((id) => fromString(id).id.split(','))
    return await Promise.all(
      gameReleaseIds.map(async (ids) => {
        const releases = await Promise.all(
          ids.map((id) => {
            return this.gameRelease.getById(id)
          }),
        )
        return toGameEntity(releases)
      }),
    )
  })

  return autoBind(this, {
    async getById(this: DomainApi, id: string) {
      return loader.load(id)
    },
    async getAll(this: DomainApi) {
      const gameReleases = await this.gameRelease.getAll()
      const groupedReleases = groupBy(gameReleases, (game) => game.name)
      return Object.values(groupedReleases).map((releases) =>
        toGameEntity(releases),
      )
    },
  })
}

export default create
