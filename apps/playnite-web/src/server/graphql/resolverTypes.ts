type PlatformEntity = {
  specificationId: string
  icon: string
  cover: string
  name: string
  background: string
  id: string
}

type FeatureEntity = {
  name: string
  id: string
}

type CompletionStatusEntity = {
  name: string
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

type PlatformSourceEntity = {
  id: string
  name: string
  source: string
}

type GameEntity = {
  id: string
  name: string
  description: string
  releases: GameReleaseEntity[]
}

type GameReleaseEntity = {
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
  platform: PlatformEntity
  publishers: { id: string; name: string }[]
  recentActivity: string
  releaseDate: { month: number; day: number; year: number }
  releaseYear: number
  series: { id: string; name: string }[]
  sortingName?: string
  sortName: string
  source: SourceEntity
  tags: Array<TagEntity> | null
}

type PlaylistEntity = {
  id: string
  name: string
  games: Array<GameEntity>
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
  PlatformSourceEntity,
  PlaylistEntity,
  SourceEntity,
  TagEntity,
}
