import {
  Feature,
  IGame,
  IIdentifyDomainObjects,
  IPlaylist,
} from '../../domain/types'

type AssetTypeKey = 'background' | 'cover' | 'icon'

type GameAsset = {
  id: string
  file: Buffer
  related: IIdentifyDomainObjects
  typeKey: AssetTypeKey
}

interface IGameApi {
  getPlaylistByName(name: string): Promise<IPlaylist>
  getPlaylists(): Promise<IPlaylist[]>
  getGameById(oid: IIdentifyDomainObjects): Promise<IGame>
  getGames(): Promise<IGame[]>
  getFeatures(): Promise<Feature[]>
  getAssetsRelatedTo(oid: IIdentifyDomainObjects): Promise<GameAsset[]>
}

export type { AssetTypeKey, GameAsset, IGameApi }
