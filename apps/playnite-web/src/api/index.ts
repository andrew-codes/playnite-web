import type {
  Api,
  Game,
  IdentifyDomainObjects,
} from 'apps/playnite-web/src/api/types'
import type { MongoDbApi } from './databases/mongo'
import MongoDb from './databases/mongo'

class PlayniteWebApi implements Api {
  private mongo: MongoDbApi

  constructor() {
    this.mongo = new MongoDb()
  }

  getAssetRelatedTo(oid: IdentifyDomainObjects): Promise<Buffer> {
    return this.mongo.getAssetRelatedTo(oid)
  }

  async getGames(): Promise<Game[]> {
    return this.mongo.getGames()
  }

  async getGameById(id: string): Promise<Game> {
    return this.mongo.getGameById(id)
  }
}

export default PlayniteWebApi
