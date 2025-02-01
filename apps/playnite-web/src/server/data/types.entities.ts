/**
 * Foundation of all data entities; all data entities have an ID.
 */
type Identifiable = {
  /**
   * @type Guid string
   */
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
  'Connection',
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
  Connection: [],
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

/**
 * Supported entities.
 */
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
  | Connection

type Connection = Identifiable & {
  _type: 'Connection'
  state: boolean
}

/**
 * Platform data entity.
 *
 * @remarks
 * Platforms are used to categorize games by the system they are played on. Note a game may have multiple releases for a single platform. An example of this would be a game released on the PC platform for Steam and Epic sources.
 */
type Platform = Identifiable & {
  _type: 'Platform'
  /**
   * Background image ID.
   *
   * @remarks
   * Images are served from `domain/asset-by-id/{id}`.
   */
  background: string | null
  /** Cover image ID.
   *
   * @remarks
   * Images are served from  `domain/asset-by-id/{id}`.
   */
  cover: string | null
  icon: string | null
  /**
   * Platform name.
   */
  name: string
  /**
   * @remarks Provided by Playnite, but not currently used.
   */
  specificationId: string
}

/**
 * Series data entity.
 *
 * @remarks
 * Series are used to group releases together across different games.
 *
 * @example
 * The "Assassin's Creed" series would include all games in the "Assassin's Creed" franchise.
 */
type Series = Identifiable & {
  _type: 'Series'
  name: string
}

/**
 * Game feature data entity.
 *
 * @remarks
 * Features are used to describe a game's characteristics.
 */
type GameFeature = Identifiable & {
  _type: 'Feature'
  name: string
}

/**
 * Genre data entity.
 *
 * @remarks
 * Genres are used to categorize games by their game play characteristics.
 */
type Genre = Identifiable & {
  _type: 'Genre'
  name: string
}

/**
 * Completion status data entity.
 *
 * @remarks
 * Completion statuses are used to describe a player's progress in a game.
 */
type CompletionStatus = Identifiable & {
  _type: 'CompletionStatus'
  name: string
}

/**
 * Tag data entity.
 *
 *  @remarks
 * Tags are used to categorize games by their characteristics.
 */
type Tag = Identifiable & {
  _type: 'Tag'
  name: string
}

/**
 * Game source data entity.
 *
 * @remarks
 * Sources are used to describe where a game was obtained.
 */
type GameSource = Identifiable & {
  _type: 'Source'
  name: string
}

/**
 * Game data entity.
 *
 * @remarks
 * A game is a grouping of releases that share the same name.
 * The game's ID is computed from the name of its releases.
 *
 * A game may have multiple releases across different platforms and sources.
 */
type Game = Identifiable & {
  _type: 'Game'
  description: string | null
  name: string
  releaseIds: Array<string>
  cover: string | null
}

/**
 * Possible run state values.
 */
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
/**
 * Run state data entity.
 *
 * @remarks
 * Run states are used to describe the current state of a game's process.
 */
type RunState = { id: (typeof runStates)[number] }

/**
 * Release data entity.
 *
 * @remarks
 * A release is a specific version of a game that is available on a platform and source. Each platform and source combination will have a single release.
 */
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
  /**
   * Id of the release as provided by the release's source.
   *
   * @remarks
   * This is used to uniquely identify a release within the context of a single source. This may be helpful for automating the running of games on non-PC platforms.
   */
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

/**
 * Playlist data entity.
 *
 * @remarks
 * Playlists are used to group games together for easy access. A playlist consists of all games that have any of their releases tagged with value that follows the format `playlist-{playlist name}`.
 */
type Playlist = Identifiable & {
  _type: 'Playlist'
  /**
   * Name of the playlist.
   *
   * @remarks
   * This is the value of the playlist's name; removing the `playlist-` prefix.
   */
  name: string
  gameIds: Array<string>
}

/**
 * Game asset type data entity.
 *
 * @remarks
 * Game asset types represent the types of game assets that can be associated with an entity.
 */
type GameAssetType = { id: 'background' | 'cover' | 'icon' }

type GameAssetRelatedType = 'games' | 'platforms'

/**
 * Game asset data entity.
 *
 * @remarks
 * Game assets are used to associate images with entities.
 */
type GameAsset = Identifiable & {
  _type: 'GameAsset'
  relatedId: string
  relatedType: GameAssetRelatedType
  typeKey: GameAssetType
}

/**
 * User data entity.
 *
 * @remarks
 * Users are used to authenticate and authorize access to the application.
 */
type User = Identifiable & {
  _type: 'User'
  username: string
  password: string
  isAuthenticated: boolean
}

export { entities, RelationshipTypes, runStates }
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
