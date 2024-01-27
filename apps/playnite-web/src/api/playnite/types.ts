import {
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

interface PlayniteApi {
  getPlaylists(): Promise<Playlist[]>
  getGameById(id: string): Promise<GameOnPlatform>
  getGames(): Promise<GameOnPlatform[]>
  getPlaylistsGames(
    playlists: Playlist[],
  ): Promise<[Playlist, GameOnPlatform[]][]>
  getAssetsRelatedTo(oid: IdentifyDomainObjects): Promise<GameAsset[]>
}

export type { AssetTypeKey, GameAsset, PlayniteApi }
