import createDebugger from 'debug'
import _ from 'lodash'
import { MongoClient } from 'mongodb'
import Oid from '../../Oid'
import { NoScore, NumericScore } from '../../Score'
import type { GameEntity } from '../../dbTypes'
import type {
  Game,
  GameAsset,
  IdentifyDomainObjects,
  Playlist,
  RunState,
  Tag,
} from '../../types'
import { getDbClient } from './client'

const debug = createDebugger('playnite-web-app/MongoDbApi')
const { startCase, toLower } = _

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

const gameEntityToGame = (gameEntity: GameEntity): Game => ({
  oid: new Oid(`game:${gameEntity.id}`),
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

interface MongoDbApi {
  getGameById(id: string): Promise<Game>
  getGames(): Promise<Game[]>
  getTags(): Promise<Tag[]>
  getAssetsRelatedTo(oid: IdentifyDomainObjects): Promise<GameAsset[]>
  getTagsGames(tags: Tag[]): Promise<[Playlist, Game[]][]>
}

class MongoDb implements MongoDbApi {
  private client: MongoClient
  private isConnected: boolean

  constructor() {
    this.client = getDbClient()
    this.isConnected = false
    this.client.on('connectionCreated', () => {
      debug('Connected to MongoDB')
      this.isConnected = true
    })
    this.client.on('connectionClosed', () => {
      debug('Disconnected from MongoDB')
      this.isConnected = false
    })
  }

  async getTags(): Promise<Tag[]> {
    await this.connect()

    return (await this.client
      .db('games')
      .collection('tag')
      .find({})
      .toArray()) as unknown as Tag[]
  }

  async getTagsGames(tags: Tag[]): Promise<[Playlist, Game[]][]> {
    await this.connect()

    return await Promise.all(
      tags.map(async (tag) => {
        const games = await this.client
          .db('games')
          .collection('game')
          .find({ 'tags.id': tag.id })
          .map<Game>((entity) => {
            const gameEntity = entity as GameEntity

            return gameEntityToGame(gameEntity)
          })
          .toArray()

        return [tag, games]
      }),
    )
  }

  private async connect() {
    if (!this.isConnected) {
      await this.client.connect()
    }
  }

  async getAssetsRelatedTo(oid: IdentifyDomainObjects): Promise<GameAsset[]> {
    await this.connect()

    const foundAssets = await this.client
      .db('games')
      .collection('assets')
      .find({ relatedId: oid.id, relatedType: oid.type })

    return foundAssets
      .map<GameAsset>((asset) => ({
        id: asset.id,
        file: asset.file.value(true),
        related: { id: asset.relatedId, type: asset.relatedType },
        typeKey: asset.typeKey,
      }))
      .toArray()
  }

  async getGameById(id: string): Promise<Game> {
    await this.connect()

    const gameEntity = (await this.client
      .db('games')
      .collection('game')
      .findOne({ id })) as unknown as GameEntity | null

    if (!gameEntity) {
      throw new Error(`Not game found matching ${id}`)
    }

    return gameEntityToGame(gameEntity as unknown as GameEntity)
  }

  async getGames(): Promise<Game[]> {
    await this.connect()

    return this.client
      .db('games')
      .collection('game')
      .find({})
      .map<Game>((entity) => {
        const gameEntity = entity as GameEntity

        return gameEntityToGame(gameEntity)
      })
      .toArray()
  }
}

export default MongoDb
export type { MongoDbApi }
