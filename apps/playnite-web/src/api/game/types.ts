import {
  Feature,
  IGame,
  IIdentifyDomainObjects,
  IPlaylist,
} from '../../domain/types'
import { IIdentify } from '../../server/oid'

type AssetTypeKey = 'background' | 'cover' | 'icon'

type GameAsset = {
  id: string
  related: IIdentifyDomainObjects
  typeKey: AssetTypeKey
}

interface IGameApi {
  getPlaylistByName(name: string): Promise<IPlaylist>
  getPlaylists(): Promise<IPlaylist[]>
  getGameById(oid: IIdentifyDomainObjects): Promise<IGame>
  getGames(): Promise<IGame[]>
  getFeatures(): Promise<Feature[]>
  getAssetsRelatedTo(
    oid: IIdentify,
    typeKey?: AssetTypeKey,
  ): Promise<GameAsset[]>
}

export type { AssetTypeKey, GameAsset, IGameApi }
