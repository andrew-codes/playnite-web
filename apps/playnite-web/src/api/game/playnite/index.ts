import _ from 'lodash'
import Game from '../../../domain/Game'
import GameList from '../../../domain/GameList'
import GameOnPlatform from '../../../domain/GameOnPlatform'
import Oid from '../../../domain/Oid'
import { TagPlaylist } from '../../../domain/Playlist'
import type {
  Feature,
  GameAssetType,
  GameOnPlatformDto,
  IGame,
  IGameOnPlatform,
  IIdentifyDomainObjects,
  IPlaylist,
  RunState,
} from '../../../domain/types'
import { GameAsset, IGameApi } from '../types'
import MongoDb from './databases/mongo/index.server'
import {
  GameAssetEntityType,
  GameEntity,
  MongoDbApi,
} from './databases/mongo/types'

const { groupBy, startCase, toLower } = _

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

  async getAssetsRelatedTo(oid: IIdentifyDomainObjects): Promise<GameAsset[]> {
    return (await this._mongo.getAssetsByType(oid.type as GameAssetEntityType))
      .filter((asset) =>
        oid.isEqual(new Oid(`${asset.relatedType}:${asset.relatedId}`)),
      )
      .map((asset) => ({
        id: asset.id,
        file: Buffer.from(asset.file.value()),
        related: new Oid(`${asset.relatedType}:${asset.relatedId}`),
        typeKey: asset.typeKey as GameAssetType,
      }))
  }

  async getGames(): Promise<IGame[]> {
    return Object.values(
      groupBy(
        (await this._mongo.getGames()).map(this.gameEntityToGameOnPlatform),
        'sortName',
      ),
    ).map((groupedGames) => new Game(groupedGames))
  }

  async getGameById(id: IIdentifyDomainObjects): Promise<IGame> {
    const gameEntities = await this._mongo.getGames({
      id: { $in: id.id.split(',') },
    })

    return new Game(gameEntities.map(this.gameEntityToGameOnPlatform))
  }

  private gameEntityToGameOnPlatform(gameEntity: GameEntity): IGameOnPlatform {
    const gameOnPlatform: GameOnPlatformDto = {
      added: new Date(gameEntity.added),
      ageRating: gameEntity.ageRating,
      communityScore: gameEntity.communityScore,
      completionStatus: gameEntity.completionStatus,
      criticScore: gameEntity.criticScore,
      description: gameEntity.description,
      developers: gameEntity.developers,
      features: gameEntity.features,
      gameId: gameEntity.gameId,
      genres: gameEntity.genres,
      hidden: gameEntity.hidden,
      id: gameEntity.id,
      isInstalled: gameEntity.isInstalled,
      isInstalling: gameEntity.isInstalling,
      isLaunching: gameEntity.isLaunching,
      isRunning: gameEntity.isRunning,
      isUninstalling: gameEntity.isUninstalling,
      isCustomGame: gameEntity.isCustomGame,
      links: gameEntity.links,
      name: gameEntity.name,
      platforms: gameEntity.platforms ?? [],
      publishers: gameEntity.publishers,
      recentActivity: new Date(gameEntity.recentActivity),
      releaseDate: new Date(gameEntity.releaseDate),
      runState: getRunState(gameEntity),
      sortName: startCase(toLower(gameEntity.name)),
      series: gameEntity.series,
      source: gameEntity.source,
      tags: gameEntity.tags,
    }

    return new GameOnPlatform(gameOnPlatform)
  }
}

export default PlayniteWebApi
