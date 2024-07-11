import { Document, WithId } from 'mongodb'

type PlatformDbEntity = {
  specificationId: string
  icon: string
  cover: string
  name: string
  background: string
  id: string
}

type FeatureDbEntity = WithId<Document> & {
  name: string
  id: string
}

type CompletionStatusDbEntity = WithId<Document> & {
  name: string
  id: string
}

type TagDbEntity = WithId<Document> & {
  id: string
  name: string
}

type SourceDbEntity = {
  id: string
  name: string
}

type GameReleaseDbEntity = WithId<Document> & {
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
  platforms: PlatformDbEntity[]
  platformsIds: string[]
  publishers: { id: string; name: string }[]
  publishersIds: string[]
  recentActivity: string
  releaseDate: string
  releaseYear: number
  series: { id: string; name: string }[]
  seriesIds: string[]
  sortingName?: string
  sortName: string
  source: SourceDbEntity
  sourceId: string | null
  tags: Array<TagDbEntity> | null
  tagsIds: string[]
}

type GameAssetDbType = 'background' | 'cover' | 'icon'

type GameAssetEntityDbType = 'games' | 'platforms'

type GameAssetDbEntity = {
  id: string
  relatedId: string
  relatedType: GameAssetEntityDbType
  typeKey: GameAssetDbType
}

export type {
  CompletionStatusDbEntity,
  FeatureDbEntity,
  GameAssetDbEntity,
  GameAssetDbType,
  GameAssetEntityDbType,
  GameReleaseDbEntity,
  PlatformDbEntity,
  SourceDbEntity,
  TagDbEntity,
}
