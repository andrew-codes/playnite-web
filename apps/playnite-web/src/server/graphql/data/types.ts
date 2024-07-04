import { Document, WithId } from 'mongodb'

type PlatformEntity = WithId<Document> & {
  specificationId: string
  icon: string
  cover: string
  name: string
  background: string
  id: string
}

type FeatureEntity = WithId<Document> & {
  name: string
  id: string
}

type CompletionStatusEntity = WithId<Document> & {
  name: string
  id: string
}

type TagEntity = WithId<Document> & {
  id: string
  name: string
}

type SourceEntity = WithId<Document> & {
  id: string
  name: string
}

type GameEntity = Array<GameReleaseEntity>

type GameReleaseEntity = WithId<Document> & {
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
  featureIds: string[] | null
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
  source: { id: string; name: string } | null
  sourceId: string | null
  tags:
    | {
        id: string
        name: string
      }[]
    | null
  tagsIds: string[]
}

type GameAssetType = 'background' | 'cover' | 'icon'

type GameAssetEntityType = 'games' | 'platforms'

type GameAssetEntity = {
  id: string
  relatedId: string
  relatedType: GameAssetEntityType
  typeKey: GameAssetType
}

export type {
  CompletionStatusEntity,
  FeatureEntity,
  GameAssetEntity,
  GameAssetEntityType,
  GameAssetType,
  GameEntity,
  GameReleaseEntity,
  PlatformEntity,
  SourceEntity,
  TagEntity,
}
