import { Binary, Document, Filter, WithId } from 'mongodb'
import type {
  GameAssetType,
  IIdentifyDomainObjects,
} from '../../../../../domain/types'
import { AssetTypeKey } from '../../../types'

type PlatformEntity = {
  specificationId: string
  icon: string
  cover: string
  name: string
  background: string
  id: string
}

type TagEntity = {
  id: string
  name: string
}

type SourceEntity = {
  id: string
  name: string
}

type GameEntity = WithId<Document> & {
  added: string
  ageRating: string
  backgroundImage: string
  communityScore: number | null
  completionStatus: { id: string; name: string }
  completionStatusId: string
  cover: string
  coverImage: string
  criticScore: number | null
  description: string
  developers: { id: string; name: string }[]
  developersIds: string[]
  features: { id: string; name: string }[]
  featuresIds: string[]
  gameId: string
  genres: { id: string; name: string }[]
  genresIds: string[]
  hidden: boolean
  id: string
  isCustomGame: boolean
  isInstalled: boolean
  isInstalling: boolean
  isLaunching: boolean
  isRunning: boolean
  isUninstalling: boolean
  links: { name: string; url: string }[]
  name: string
  platforms: PlatformEntity[] | null
  platformsIds: string[]
  publishers: { id: string; name: string }[]
  publishersIds: string[]
  recentActivity: string
  releaseDate: string
  releaseYear: number
  runState: string
  series: { id: string; name: string }[]
  seriesIds: string[]
  sortingName?: string
  sortName: string
  source: SourceEntity | null
  sourceId: string | null
  tags: TagEntity[] | null
  tagsIds: string[]
}

type GameAssetEntityType = 'games' | 'platforms'

type GameAssetEntity = {
  id: string
  file: Binary
  relatedId: string
  relatedType: GameAssetEntityType
  typeKey: GameAssetType
}

interface MongoDbApi {
  getGameById(id: string): Promise<GameEntity>
  getGames(filter?: Filter<GameEntity>): Promise<GameEntity[]>
  getTags(): Promise<TagEntity[]>
  getFilterTypeValues(
    filterTypeName: string,
  ): Promise<{ id: string; name: string }[]>
  getAssetsByType(
    oid: IIdentifyDomainObjects,
    typeKey?: AssetTypeKey,
  ): Promise<GameAssetEntity[]>
  getTagsGames(tagIds: string[]): Promise<[TagEntity, GameEntity[]][]>
}

export type {
  GameAssetEntity,
  GameAssetEntityType,
  GameEntity,
  MongoDbApi,
  PlatformEntity,
  TagEntity,
}
