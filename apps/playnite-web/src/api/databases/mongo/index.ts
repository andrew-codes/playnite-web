import createDebugger from 'debug'
import _ from 'lodash'
import { MongoClient } from 'mongodb'
import Oid from '../../Oid'
import { NoScore, NumericScore } from '../../Score'
import type { GameEntity } from '../../dbTypes'
import type { Game, IdentifyDomainObjects, RunState } from '../../types'
import { getDbClient } from './client'

const debug = createDebugger('playnite-web/MongoDbApi')
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
  oid: new Oid(`games:${gameEntity.id}`),
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
  // platforms: Platform[],
  // publishers: Publisher[],
  recentActivity: new Date(gameEntity.recentActivity),
  releaseDate: new Date(gameEntity.releaseDate),
  runState: getRunState(gameEntity),
  sortName: startCase(toLower(gameEntity.name)),
  // series: Series[],
  // source: Source,
  // tags: Tag[],
})

interface MongoDbApi {
  getGameById(id: string): Promise<Game>
  getGames(): Promise<Game[]>
  getAssetRelatedTo(oid: IdentifyDomainObjects): Promise<Buffer>
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

  private async connect() {
    if (!this.isConnected) {
      await this.client.connect()
    }
  }

  async getAssetRelatedTo(oid: IdentifyDomainObjects): Promise<Buffer> {
    await this.connect()

    const foundAsset = await this.client
      .db('games')
      .collection('assets')
      .findOne({ relatedId: oid.id, relatedType: oid.type })

    if (!foundAsset) {
      throw new Error(`No asset found matching ${JSON.stringify(oid)}`)
    }

    return foundAsset.file.value(true)
  }

  async getGameById(id: string): Promise<Game> {
    await this.connect()

    const gameEntity = (await this.client
      .db('games')
      .collection('games')
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
      .collection('games')
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
