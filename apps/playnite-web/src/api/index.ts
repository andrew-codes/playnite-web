import type { Api, Game } from 'apps/playnite-web/src/api/types'
import type { MongoDbApi } from './databases/mongo'
import MongoDb from './databases/mongo'

class PlayniteWebApi implements Api {
  private mongo: MongoDbApi

  constructor() {
    this.mongo = new MongoDb()
  }

  async getGames(): Promise<Game[]> {
    return this.mongo.getGames()
  }
}

export default PlayniteWebApi
