import createDebugger from 'debug'
import { MongoClient } from 'mongodb'
import { getDbClient } from './client'
import {
  GameAssetEntity,
  GameAssetEntityType,
  GameEntity,
  MongoDbApi,
  TagEntity,
} from './types'

const debug = createDebugger('playnite-web-app/MongoDbApi')

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

  getFilterTypeValues(
    filterTypeName: string,
  ): Promise<{ id: string; name: string }[]> {
    return this.client
      .db('games')
      .collection<{ id: string; name: string }>(filterTypeName)
      .find({})
      .toArray()
  }

  async getTags(): Promise<TagEntity[]> {
    await this.connect()

    return this.client
      .db('games')
      .collection<TagEntity>('tag')
      .find({})
      .toArray()
  }

  async getTagsGames(tags: string[]): Promise<[TagEntity, GameEntity[]][]> {
    await this.connect()

    return (
      await Promise.all(
        tags.map(async (tagId) =>
          Promise.all([
            this.client
              .db('games')
              .collection<TagEntity>('tag')
              .findOne({ id: tagId }),
            this.client
              .db('games')
              .collection<GameEntity>('game')
              .find({ 'tags.id': tagId })
              .toArray(),
          ]),
        ),
      )
    ).filter(([tag]) => !!tag) as [TagEntity, GameEntity[]][]
  }

  private async connect() {
    if (!this.isConnected) {
      await this.client.connect()
    }
  }

  async getAssetsRelatedTo(
    relatedId: string,
    relatedType: GameAssetEntityType,
  ): Promise<GameAssetEntity[]> {
    await this.connect()

    return this.client
      .db('games')
      .collection<GameAssetEntity>('assets')
      .find({ relatedId, relatedType })
      .toArray()
  }

  async getGameById(id: string): Promise<GameEntity> {
    await this.connect()

    const gameEntity = (await this.client
      .db('games')
      .collection<GameEntity>('game')
      .findOne({ id })) as unknown as GameEntity | null

    if (!gameEntity) {
      throw new Error(`Not game found matching ${id}`)
    }

    return gameEntity
  }

  async getGames(): Promise<GameEntity[]> {
    await this.connect()

    return this.client
      .db('games')
      .collection<GameEntity>('game')
      .find({})
      .toArray()
  }
}

export default MongoDb
