type DomainType =
  | 'agerating'
  | 'assets'
  | 'company'
  | 'completionstatus'
  // | 'developer'
  | 'gamefeature'
  | 'game'
  | 'gamesource'
  | 'genre'
  | 'platform'
  // | 'publisher'
  | 'region'
  | 'series'
  | 'tag'
  | 'gamesonplatforms'

interface IdentifyDomainObjects {
  get id(): string
  get type(): DomainType
  get asString(): string
}

type Platform = {
  id: string
  name: string
  background: string
  cover: string
  icon: string
}

type Genre = {
  id: string
  name: string
}

type Tag = {
  id: string
  name: string
}

type Publisher = {
  id: string
  name: string
}

type Series = {
  id: string
  name: string
}

type Source = {
  id: string
  name: string
}

type Feature = {
  id: string
  name: string
}

type Developer = {
  id: string
  name: string
}

interface Score {
  get value(): string
}

type CompletionStatus = {
  id: string
  name: string
}

type AgeRating = {
  id: string
  name: string
}

type Playlist = {
  id: string
  name: string
}

const runStates = [
  'installed',
  'installing',
  'launching',
  'running',
  'uninstalling',
  'not installed',
] as const
type RunState = (typeof runStates)[number]

type GameOnPlatform = {
  added: Date
  ageRating?: AgeRating
  background: string
  communityScore: Score
  completionStatus?: CompletionStatus
  cover: string
  criticScore: Score
  description: string
  developers?: Developer[]
  features?: Feature[]
  gameId: string
  genres?: Genre[]
  hidden: boolean
  icon: string
  id: string
  isCustomGame: boolean
  name: string
  platform?: Platform
  publishers?: Publisher[]
  recentActivity: Date
  releaseDate: Date
  runState: RunState
  series?: Series[]
  sortName: string
  source?: Source
  tags?: Tag[]
}

interface IGame {
  get oid(): IdentifyDomainObjects
  get name(): string
  get background(): string
  get cover(): string
  get description(): string
  get series(): Series[]
  get platforms(): GameOnPlatform[]
}

interface IGameList {
  get games(): IGame[]
}

interface IMatchA<T> {
  matches(item: T): boolean
}
type GameAssetType = 'background' | 'cover' | 'icon'

type GameAsset = {
  id: string
  file: Buffer
  related: IdentifyDomainObjects
  typeKey: GameAssetType
}

export type {
  AgeRating,
  CompletionStatus,
  Developer,
  DomainType,
  Feature,
  GameAsset,
  GameAssetType,
  GameOnPlatform,
  Genre,
  IGame,
  IGameList,
  IMatchA,
  IdentifyDomainObjects,
  Platform,
  Playlist,
  Publisher,
  RunState,
  Score,
  Series,
  Source,
  Tag,
}
