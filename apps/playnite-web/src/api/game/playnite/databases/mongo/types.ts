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
    completionStatus: string
    cover: string
    coverImage: string
    criticScore: number | null
    developersIds: string[]
    featuresIds: string[]
    genresIds: string[]
    isInstalled: boolean
    isInstalling: boolean
    isLaunching: boolean
    isRunning: boolean
    isUninstalling: boolean
    platformsIds: string[]
    publishersIds: string[]
    recentActivity: string
    releaseDate: string
    seriesIds: string[]
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
