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
  cover: string
  coverImage: string
  criticScore: number | null
  description: string
  developers: { id: string; name: string }[]
  features: { id: string; name: string }[]
  gameId: string
  genres: { id: string; name: string }[]
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
  platform: PlatformDbEntity
  publishers: { id: string; name: string }[]
  recentActivity: string
  releaseDate: {
    day: number
    month: number
    year: number
  }
  releaseYear: number
  series: { id: string; name: string }[]
  sortingName?: string
  sortName: string
  source: SourceDbEntity
  sourceId: string | null
  tags: Array<TagDbEntity> | null
}

type PlaylistDbEntity = {
  id: string
  name: string
  games: Array<GameDbEntity>
}

type GameDbEntity = {
  id: string
  name: string
  description: string
  releases: GameReleaseDbEntity[]
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
  GameDbEntity,
  GameReleaseDbEntity,
  PlatformDbEntity,
  PlaylistDbEntity,
  SourceDbEntity,
  TagDbEntity,
}
