import _ from 'lodash'
import Game from '../../../domain/Game'
import Oid from '../../../domain/Oid'
import { NoScore, NumericScore } from '../../../domain/Score'
import type {
  Feature,
  GameAssetType,
  GameOnPlatform,
  IdentifyDomainObjects,
  Playlist,
  RunState,
  WithId,
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

  async getPlaylistByName(name: string): Promise<Playlist> {
    const playlists = await this.getPlaylists()

    const playlist = playlists.find((playlist) => playlist.name === name)
    if (!playlist) {
      throw new Error('Playlist not found')
    }

    return playlist
  }

  async getPlaylists(): Promise<Playlist[]> {
    const tags = await this._mongo.getTags()

    return Promise.all(
      tags
        .filter(({ name }) => this._playlistMatcher.test(name))
        .map(async (tag) => ({
          id: tag.id,
          name: tag.name.replace(this._playlistMatcher, ''),
          games: await this.getPlaylistsGames(tag),
        })),
    )
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

  async getGames(): Promise<Game[]> {
    return Object.values(
      groupBy(
        (await this._mongo.getGames()).map(this.gameEntityToGame),
        'sortName',
      ),
    ).map((groupedGames) => new Game(groupedGames))
  }

  async getGameById(id: string): Promise<Game> {
    const gameEntity = await this._mongo.getGameById(id)
    const gameEntities = await this._mongo.getGames({
      sortName: gameEntity.sortName,
      id: { $ne: gameEntity.id },
    })

    return new Game(
      [gameEntity].concat(gameEntities).map(this.gameEntityToGame),
    )
  }

  private async getPlaylistsGames(playlist: WithId): Promise<GameOnPlatform[]> {
    const tagsGames = await this._mongo.getTagsGames([playlist.id])

    return tagsGames.flatMap(([tag, games]) => games.map(this.gameEntityToGame))
  }

  private gameEntityToGame(gameEntity: GameEntity): GameOnPlatform {
    return {
      added: new Date(gameEntity.added),
      // ageRating: AgeRating,
      background: gameEntity.backgroundImage?.replace(`${gameEntity.id}\\`, ''),
      communityScore: gameEntity.communityScore
        ? new NumericScore(gameEntity.communityScore)
        : new NoScore(),
      completionStatus: gameEntity.completionStatus,
      cover: gameEntity.coverImage?.replace(`${gameEntity.id}\\`, ''),
      criticScore: gameEntity.criticScore
        ? new NumericScore(gameEntity.criticScore)
        : new NoScore(),
      description: gameEntity.description,
      developers: gameEntity.developers,
      features: gameEntity.features,
      gameId: gameEntity.gameId,
      genres: gameEntity.genres,
      hidden: gameEntity.hidden,
      icon: gameEntity.icon,
      id: gameEntity.id,
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
      // tags: Tag[],
    }
  }
}

export default PlayniteWebApi
