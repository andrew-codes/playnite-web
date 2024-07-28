import _ from 'lodash'
import Game from '../../../domain/Game'
import GameList from '../../../domain/GameList'
import GameOnPlatform from '../../../domain/GameOnPlatform'
import Oid from '../../../domain/Oid'
import { TagPlaylist } from '../../../domain/Playlist'
import type {
  AgeRating,
  Feature,
  GameAssetType,
  IGame,
  IGameOnPlatform,
  IIdentifyDomainObjects,
  IPlaylist,
  RunState,
} from '../../../domain/types'
import { IIdentify } from '../../../server/oid'
import { AssetTypeKey, GameAsset, IGameApi } from '../types'
import MongoDb from './databases/mongo/index.server'
import { GameEntity, MongoDbApi, PlatformEntity } from './databases/mongo/types'

const { groupBy, merge, startCase, toLower } = _

const getRunState = (gameEntity: GameEntity): RunState => {
  if (gameEntity.isRunning) {
    return 'running'
  } else if (gameEntity.isLaunching) {
    return 'launching'
  } else if (gameEntity.isInstalling) {
    return 'installing'
  } else if (gameEntity.isInstalled) {
    return 'installed'
  } else if (gameEntity.isUninstalling) {
    return 'uninstalling'
  }

  return 'not installed'
}

const steam = /steam/i
const epic = /epic/i
const origin = /origin/i
const uplay = /uplay/i
const gog = /gog/i
const battleNet = /battle\.net/i
const ea = /ea app/i
const xbox = /xbox/i
const playstation = /playstation/i
const nintendo = /nintendo/i

const ps4Game = /^CUSA/i
const ps5Game = /^PPSA/i

const pc = /Windows/i
const ps5 = /PlayStation 5/
const ps4 = /PlayStation 4/
const ps3 = /PlayStation 3/
const nintendoSwitch = /Nintendo Switch/i
const xboxOne = /Xbox One/i

class PlayniteWebApi implements IGameApi {
  private _mongo: MongoDbApi
  private _playlistMatcher = new RegExp(/^playlist-/, 'i')

  constructor() {
    this._mongo = new MongoDb()
  }

  async getFeatures(): Promise<Feature[]> {
    return this._mongo.getFilterTypeValues('gamefeature')
  }

  async getPlaylistByName(name: string): Promise<IPlaylist> {
    const playlists = await this.getPlaylists()

    const playlist = playlists.find((playlist) => playlist.toString() === name)
    if (!playlist) {
      throw new Error('Playlist not found')
    }

    return playlist
  }

  async getPlaylists(): Promise<IPlaylist[]> {
    const tags = await this._mongo.getTags()
    const games = await this.getGames()

    return tags
      .filter((tag) => this._playlistMatcher.test(tag.name))
      .map(
        (tag) =>
          new TagPlaylist({ tagName: tag.name, games: new GameList(games) }),
      )
  }

  async getAssetsRelatedTo(
    oid: IIdentify,
    typeKey?: AssetTypeKey,
  ): Promise<GameAsset[]> {
    return (await this._mongo.getAssetsByType(oid, typeKey)).map((asset) => ({
      id: asset.id,
      related: new Oid(`${asset.relatedType}:${asset.relatedId}`),
      typeKey: asset.typeKey as GameAssetType,
    }))
  }

  async getGames(): Promise<IGame[]> {
    const gameEntities = await this._mongo.getGames()
    const groupedBySortName = Object.values(
      groupBy(
        gameEntities.map((ge) =>
          merge({}, ge, {
            sortingName: ge.sortingName ?? startCase(toLower(ge.name)),
          }),
        ),
        (ge) => startCase(toLower(ge.name)),
      ),
    )

    return groupedBySortName.map(
      (groupedGames) => new Game(this.gameEntityToGameOnPlatform(groupedGames)),
    )
  }

  async getGameById(id: IIdentifyDomainObjects): Promise<IGame> {
    const gameEntities = await this._mongo.getGames({
      id: { $in: id.id.split(',') },
    })

    return new Game(this.gameEntityToGameOnPlatform(gameEntities))
  }

  private gameEntityToGameOnPlatform(
    gameEntities: GameEntity[],
  ): IGameOnPlatform[] {
    return gameEntities.map(
      (entity) =>
        new GameOnPlatform({
          added: new Date(entity.added),
          ageRating: entity.ageRating as unknown as AgeRating,
          communityScore: entity.communityScore,
          completionStatus: entity.completionStatus,
          criticScore: entity.criticScore,
          description: entity.description,
          developers: entity.developers,
          features: entity.features,
          gameId: entity.gameId,
          genres: entity.genres,
          hidden: entity.hidden,
          id: entity.id,
          isInstalled: entity.isInstalled,
          isInstalling: entity.isInstalling,
          isLaunching: entity.isLaunching,
          isRunning: entity.isRunning,
          isUninstalling: entity.isUninstalling,
          isCustomGame: entity.isCustomGame,
          links: entity.links,
          name: entity.name,
          platform: this.getPlatformDto(entity),
          publishers: entity.publishers,
          recentActivity: new Date(entity.recentActivity),
          releaseDate: new Date(entity.releaseDate),
          runState: getRunState(entity),
          sortName: entity.sortingName ?? startCase(toLower(entity.name)),
          series: entity.series,
          source: entity.source,
          tags: entity.tags ?? [],
        }),
    )
  }

  private getPlatformDto(entity: GameEntity): PlatformEntity | undefined {
    const gameSource = entity.source?.name ?? ''
    const platforms = entity.platforms ?? []

    if (
      [steam, epic, origin, uplay, gog, battleNet, ea].find((sourceTest) =>
        sourceTest.test(gameSource),
      )
    ) {
      return platforms.find((platform) => pc.test(platform.name))
    }
    if (playstation.test(gameSource)) {
      if (ps4Game.test(entity.gameId)) {
        return platforms.find((platform) => ps4.test(platform.name))
      }
      if (ps5Game.test(entity.gameId)) {
        return platforms.find((platform) => ps5.test(platform.name))
      }
      return platforms.find((platform) => ps3.test(platform.name))
    }
    if (nintendo.test(gameSource)) {
      return platforms.find((platform) => nintendoSwitch.test(platform.name))
    }
    if (xbox.test(gameSource)) {
      return platforms.find((platform) => xboxOne.test(platform.name))
    }
  }
}

export default PlayniteWebApi
