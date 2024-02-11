import {
  Feature,
  GameOnPlatform,
  IdentifyDomainObjects,
  Playlist,
} from '../../domain/types'

type AssetTypeKey = 'background' | 'cover' | 'icon'

type GameAsset = {
  id: string
  file: Buffer
  related: IdentifyDomainObjects
  typeKey: AssetTypeKey
}

interface IGameApi {
  getPlaylistByName(name: string): Promise<Playlist>
  getPlaylists(): Promise<Playlist[]>
  getGameById(id: string): Promise<GameOnPlatform>
  getGames(): Promise<GameOnPlatform[]>
  getFeatures(): Promise<Feature[]>
  getAssetsRelatedTo(oid: IdentifyDomainObjects): Promise<GameAsset[]>
}

export type { AssetTypeKey, GameAsset, IGameApi }
