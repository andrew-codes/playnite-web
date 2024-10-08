type Identifiable = {
  id: string
}

const entities = [
  'Platform',
  'GameFeature',
  'CompletionStatus',
  'Tag',
  'GameSource',
  'Game',
  'Release',
  'Playlist',
  'GameAsset',
  'Series',
  'Genre',
  'User',
] as const
type EntityType = (typeof entities)[number]

const RelationshipTypes: Record<EntityType, Array<EntityType>> = {
  Game: ['Release'],
  Platform: [],
  GameFeature: [],
  CompletionStatus: [],
  Tag: [],
  GameSource: [],
  Release: ['Platform', 'GameFeature', 'CompletionStatus', 'Tag'],
  Playlist: ['Game'],
  GameAsset: [],
  Series: [],
  User: [],
  Genre: [],
} as const

type StringFromType<T> = T extends Platform
  ? 'Platform'
  : T extends Game
    ? 'Game'
    : T extends CompletionStatus
      ? 'CompletionStatus'
      : T extends GameFeature
        ? 'GameFeature'
        : T extends Tag
          ? 'Tag'
          : T extends GameSource
            ? 'GameSource'
            : T extends Release
              ? 'Release'
              : T extends Playlist
                ? 'Playlist'
                : T extends GameAsset
                  ? 'GameAsset'
                  : T extends Series
                    ? 'Series'
                    : T extends Genre
                      ? 'Genre'
                      : T extends User
                        ? 'User'
                        : never
type TypeFromString<T> = T extends 'Platform'
  ? Platform
  : T extends 'Game'
    ? Game
    : T extends 'CompletionStatus'
      ? CompletionStatus
      : T extends 'GameFeature'
        ? GameFeature
        : T extends 'Tag'
          ? Tag
          : T extends 'GameSource'
            ? GameSource
            : T extends 'Release'
              ? Release
              : T extends 'Playlist'
                ? Playlist
                : T extends 'GameAsset'
                  ? GameAsset
                  : T extends 'Series'
                    ? Series
                    : T extends 'Genre'
                      ? Genre
                      : T extends 'User'
                        ? User
                        : never

type Entity =
  | Platform
  | GameFeature
  | CompletionStatus
  | Tag
  | GameSource
  | Game
  | Release
  | Series
  | Playlist
  | GameAsset
  | Genre
  | User

type Platform = Identifiable & {
  _type: 'Platform'
  background: string | null
  cover: string | null
  icon: string | null
  name: string
  specificationId: string
}

type Series = Identifiable & {
  _type: 'Series'
  name: string
}

type GameFeature = Identifiable & {
  _type: 'Feature'
  name: string
}

type Genre = Identifiable & {
  _type: 'Genre'
  name: string
}

type CompletionStatus = Identifiable & {
  _type: 'CompletionStatus'
  name: string
}

type Tag = Identifiable & {
  _type: 'Tag'
  name: string
}

type GameSource = Identifiable & {
  _type: 'Source'
  name: string
}

type Game = Identifiable & {
  _type: 'Game'
  description: string | null
  name: string
  releaseIds: Array<string>
  cover: string | null
}

const runStates = [
  'installed',
  'installing',
  'launching',
  'running',
  'uninstalling',
  'uninstalled',
  'stopping',
  'restarting',
] as const
type RunState = { id: (typeof runStates)[number] }

type Release = Identifiable & {
  _type: 'Release'
  added: string | null
  ageRating: string | null
  backgroundImage: string | null
  communityScore: number | null
  completionStatusId: string
  coverImage: string | null
  criticScore: number | null
  description: string | null
  developerIds: Array<string>
  featureIds: Array<string>
  gameId: string
  genreIds: Array<string>
  hidden: boolean
  isCustomGame: boolean
  runState: RunState
  isInstalled: boolean
  links: Array<{ name: string; url: string }>
  name: string
  platformId: string
  processId: string | null
  publisherIds: Array<string>
  recentActivity: string
  releaseDate?: { month: number; day: number; year: number }
  releaseYear?: number
  seriesIds: Array<string>
  sortName: string
  sourceId: string
  tagIds: Array<string>
}

type Playlist = Identifiable & {
  _type: 'Playlist'
  name: string
  gameIds: Array<string>
}

type GameAssetType = { id: 'background' | 'cover' | 'icon' }

type GameAssetRelatedType = 'games' | 'platforms'

type GameAsset = Identifiable & {
  _type: 'GameAsset'
  relatedId: string
  relatedType: GameAssetRelatedType
  typeKey: GameAssetType
}

type User = Identifiable & {
  _type: 'User'
  username: string
  password: string
  isAuthenticated: boolean
}

export { RelationshipTypes, entities, runStates }
export type {
  CompletionStatus,
  Entity,
  EntityType,
  Game,
  GameAsset,
  GameAssetRelatedType,
  GameAssetType,
  GameFeature,
  GameSource,
  Genre,
  Identifiable,
  Platform,
  Playlist,
  Release,
  RunState,
  Series,
  StringFromType,
  Tag,
  TypeFromString,
  User,
}
