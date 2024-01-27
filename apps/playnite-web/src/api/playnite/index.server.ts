import _ from 'lodash'
import Oid from '../../domain/Oid'
import { NoScore, NumericScore } from '../../domain/Score'
import type {
  GameAssetType,
  GameOnPlatform,
  IdentifyDomainObjects,
  Playlist,
  RunState,
} from '../../domain/types'
import MongoDb from './databases/mongo/index.server'
import {
  GameAssetEntityType,
  GameEntity,
  MongoDbApi,
} from './databases/mongo/types'
import { GameAsset, PlayniteApi } from './types'

const { startCase, toLower } = _

const gameEntityToGame = (gameEntity: GameEntity): GameOnPlatform => ({
  added: new Date(gameEntity.added),
  // ageRating: AgeRating,
  background: gameEntity.backgroundImage?.replace(`${gameEntity.id}\\`, ''),
  communityScore: gameEntity.communityScore
    ? new NumericScore(gameEntity.communityScore)
    : new NoScore(),
  // completionStatus: CompletionStatus,
  cover: gameEntity.coverImage?.replace(`${gameEntity.id}\\`, ''),
  criticScore: gameEntity.criticScore
    ? new NumericScore(gameEntity.criticScore)
    : new NoScore(),
  description: gameEntity.description,
  // developers: Developer[],
  // features: Feature[],
  gameId: gameEntity.gameId,
  // genres: Genre[],
  hidden: gameEntity.hidden,
  icon: gameEntity.icon,
  id: gameEntity.id,
  isCustomGame: gameEntity.isCustomGame,
  name: gameEntity.name,
  platform: gameEntity.platforms?.[0],
  // publishers: Publisher[],
  recentActivity: new Date(gameEntity.recentActivity),
  releaseDate: new Date(gameEntity.releaseDate),
  runState: getRunState(gameEntity),
  sortName: startCase(toLower(gameEntity.name)),
  // series: Series[],
  source: gameEntity.source,
  // tags: Tag[],
})

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

class PlayniteWebApi implements PlayniteApi {
  private _mongo: MongoDbApi
  private _playlistMatcher = new RegExp(/^playlist-/, 'i')

  constructor() {
    this._mongo = new MongoDb()
  }

  async getPlaylists(): Promise<Playlist[]> {
    const tags = await this._mongo.getTags()

    return tags
      .filter(({ name }) => this._playlistMatcher.test(name))
      .map((tag) => ({
        id: tag.id,
        name: tag.name.replace(this._playlistMatcher, ''),
      }))
  }

  async getAssetsRelatedTo(oid: IdentifyDomainObjects): Promise<GameAsset[]> {
    return (
      await this._mongo.getAssetsRelatedTo(
        oid.id,
        oid.type as GameAssetEntityType,
      )
    ).map((asset) => ({
      id: asset.id,
      file: Buffer.from(asset.file.value()),
      related: new Oid(`${asset.relatedType}:${asset.relatedId}`),
      typeKey: asset.typeKey as GameAssetType,
    }))
  }

  async getGames(): Promise<GameOnPlatform[]> {
    return (await this._mongo.getGames()).map(gameEntityToGame)
  }

  async getGameById(id: string): Promise<GameOnPlatform> {
    return gameEntityToGame(await this._mongo.getGameById(id))
  }

  async getPlaylistsGames(
    playlists: Playlist[],
  ): Promise<[Playlist, GameOnPlatform[]][]> {
    const tagsGames = await this._mongo.getTagsGames(
      playlists.map(({ id }) => id),
    )

    return tagsGames.map(([tag, games]) => [tag, games.map(gameEntityToGame)])
  }
}

export default PlayniteWebApi
