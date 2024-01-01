import type {
  Api,
  Game,
  IdentifyDomainObjects,
  Playlist,
} from 'apps/playnite-web/src/api/types'
import type { MongoDbApi } from './databases/mongo'
import MongoDb from './databases/mongo'

class PlayniteWebApi implements Api {
  private mongo: MongoDbApi

  constructor() {
    this.mongo = new MongoDb()
  }

  async getPlaylists(): Promise<Playlist[]> {
    const tags = await this.mongo.getTags()

    return tags
      .filter(({ name }) => name.startsWith('playlist-'))
      .map((tag) => ({ id: tag.id, name: tag.name.replace('playlist-', '') }))
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

  async getPlaylistsGames(
    playlists: Playlist[],
  ): Promise<[Playlist, Game[]][]> {
    return this.mongo.getPlaylistsGames(playlists)
  }
}

export default PlayniteWebApi
