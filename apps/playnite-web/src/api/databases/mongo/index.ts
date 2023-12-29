import { MongoClient } from 'mongodb'
import { NoScore, NumericScore } from '../../Score'
import type { GameEntity } from '../../dbTypes'
import type { Game, RunState } from '../../types'

interface MongoDbApi {
  getGames(): Promise<Game[]>
}

class MongoDb implements MongoDbApi {
  private client: MongoClient
  private isConnected: boolean

  constructor() {
    this.client = new MongoClient('mongodb://localhost:27017')
    this.isConnected = false
    this.client.on('connectionCreated', () => {
      this.isConnected = true
    })
    this.client.on('connectionClosed', () => {
      this.isConnected = false
    })
  }

  private async connect() {
    if (!this.isConnected) {
      await this.client.connect()
    }
  }

  private getRunState(gameEntity: GameEntity): RunState {
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

  async getGames(): Promise<Game[]> {
    await this.connect()

    return this.client
      .db('games')
      .collection('games')
      .find({})
      .map<Game>((entity) => {
        const gameEntity = entity as GameEntity

        return {
          added: new Date(gameEntity.added),
          // ageRating: AgeRating,
          background: gameEntity.background,
          communityScore: gameEntity.communityScore
            ? new NumericScore(gameEntity.communityScore)
            : new NoScore(),
          // completionStatus: CompletionStatus,
          cover: gameEntity.cover,
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
          runState: this.getRunState(gameEntity),
          // series: Series[],
          // source: Source,
          // tags: Tag[],
        }
      })
      .toArray()
  }
}

export default MongoDb
export type { MongoDbApi }
