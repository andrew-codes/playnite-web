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
}

type GameEntity = {
  id: string
  name: string
  description: string
  cover: string
  releases: string[]
}

type GameReleaseEntity = {
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
  platformSource: PlatformSourceEntity
  platforms: Array<PlatformEntity>
  platformsIds: string[]
  publishers: { id: string; name: string }[]
  publishersIds: string[]
  recentActivity: string
  releaseDate: { month: number; day: number; year: number }
  releaseYear: number
  series: { id: string; name: string }[]
  seriesIds: string[]
  sortingName?: string
  sortName: string
  source: SourceEntity
  sourceId: string | null
  tags: Array<TagEntity> | null
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
  PlatformSourceEntity,
  SourceEntity,
  TagEntity,
}
