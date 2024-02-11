import { Binary, Document, WithId } from 'mongodb'
import type { GameAssetType, GameOnPlatform } from '../../../../../domain/types'

type TagEntity = {
  id: string
  name: string
}

type GameEntity = WithId<Document> &
  Omit<
    GameOnPlatform,
    | 'background'
    | 'cover'
    | 'developers'
    | 'features'
    | 'genres'
    | 'platforms'
    | 'publishers'
    | 'series'
    | 'tags'
  > & {
    id: string
    ageRating: string
    backgroundImage: string
    communityScore: number | null
    completionStatusId: string
    completionStatus: { id: string; name: string }
    cover: string
    coverImage: string
    criticScore: number | null
    developersIds: string[]
    developers: { id: string; name: string }[]
    featuresIds: string[]
    features: { id: string; name: string }[]
    genresIds: string[]
    genres: { id: string; name: string }[]
    isInstalled: boolean
    isInstalling: boolean
    isLaunching: boolean
    isRunning: boolean
    isUninstalling: boolean
    links: { name: string; url: string }[]
    platformsIds: string[]
    platforms: {
      specificationId: string
      icon: string
      cover: string
      name: string
      background: string
      id: string
    }[]
    publishersIds: string[]
    publishers: { id: string; name: string }[]
    recentActivity: string
    releaseDate: string
    seriesIds: string[]
    series: { id: string; name: string }[]
    sourceId: string
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
  getGames(): Promise<GameEntity[]>
  getTags(): Promise<TagEntity[]>
  getFilterTypeValues(
    filterTypeName: string,
  ): Promise<{ id: string; name: string }[]>
  getAssetsRelatedTo(
    relatedId: string,
    relatedType: GameAssetEntityType,
  ): Promise<GameAssetEntity[]>
  getTagsGames(tagIds: string[]): Promise<[TagEntity, GameEntity[]][]>
}

export type {
  GameAssetEntity,
  GameAssetEntityType,
  GameEntity,
  MongoDbApi,
  TagEntity,
}
