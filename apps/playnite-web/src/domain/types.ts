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
  | 'gameonplatform'

type GameAssetType = 'background' | 'cover' | 'icon'

type GameAsset = WithId & {
  file: Buffer
  related: IIdentifyDomainObjects
  typeKey: GameAssetType
}

interface WithId {
  id: string
}

type GameLink = {
  name: string
  url: string
}

type PlatformDto = WithId & {
  name: string
}

type Genre = WithId & {
  name: string
}

type Tag = WithId & {
  name: string
}

type Publisher = WithId & {
  name: string
}

type Series = WithId & {
  name: string
}

type Source = WithId & {
  name: string
}

type Feature = WithId & {
  name: string
}

type Developer = WithId & {
  name: string
}

type CompletionStatusDto = WithId & {
  name: string
}

type AgeRating = WithId & {
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

type GameOnPlatformDto = WithId & {
  added: Date
  ageRating?: AgeRating
  communityScore: number
  completionStatus?: CompletionStatusDto
  criticScore: number
  description: string
  developers?: Developer[]
  features?: Feature[]
  gameId: string
  isInstalled: boolean
  isInstalling: boolean
  isLaunching: boolean
  isRunning: boolean
  isUninstalling: boolean
  links: GameLink[]
  genres?: Genre[]
  hidden: boolean
  isCustomGame: boolean
  name: string
  platform?: PlatformDto
  publishers?: Publisher[]
  recentActivity: Date
  releaseDate: Date
  runState: RunState
  series?: Series[]
  sortName: string
  source: Source
  tags?: Tag[]
}

interface IScore {
  toString(): string
  valueOf(): number
  toJSON()
}

interface IIdentifyDomainObjects {
  get id(): string
  get type(): DomainType
  get moment(): Date
  isEqual(other: IIdentifyDomainObjects): boolean
  toString(): string
  toJSON()
}

interface IAmIdentifiable {
  get id(): IIdentifyDomainObjects
}

interface IPlatform extends IAmIdentifiable {
  get icon(): string
  get cover(): string
  get background(): string
  toString(): string
  valueOf(): number
  toJSON()
}

interface ICompletionStatus extends IAmIdentifiable {
  toString(): string
  valueOf(): number
  toJSON()
}

interface IGameOnPlatform extends IAmIdentifiable {
  get added(): Date
  get ageRating(): string
  get background(): string
  get communityScore(): IScore
  get completionStatus(): ICompletionStatus
  get cover(): string
  get criticScore(): IScore
  get description(): string
  get developers(): Developer[]
  get features(): Feature[]
  get gameId(): string
  get genres(): Genre[]
  get hidden(): boolean
  get icon(): string
  get isCustomGame(): boolean
  get links(): GameLink[]
  get platform(): IPlatform
  get publishers(): Publisher[]
  get recentActivity(): Date
  get releaseDate(): Date
  get runState(): RunState
  get series(): Series[]
  get sortName(): string
  get source(): Source
  get tags(): Tag[]

  set name(name: string)
  set description(description: string)

  toString(): string
  toJSON()
}

interface IGame extends IAmIdentifiable {
  get background(): string
  get cover(): string
  get description(): string
  get developers(): Developer[]
  get platformGames(): IGameOnPlatform[]
  get series(): Series[]
  get features(): Feature[]
  get completionStatus(): ICompletionStatus

  set name(name: string)
  set description(description: string)

  toString(): string
  toJSON()
}

interface IPlaylist {
  get games(): IList<IGame>

  toString()
  toJSON()
}

interface IList<T> {
  get items(): T[]
}

type Match<T> = T & {
  matches: boolean
}
interface IMatchA<T> {
  matches(item: T): boolean
}

export type {
  AgeRating,
  CompletionStatusDto,
  Developer,
  DomainType,
  Feature,
  GameAsset,
  GameAssetType,
  GameOnPlatformDto,
  Genre,
  IAmIdentifiable,
  ICompletionStatus,
  IGame,
  IGameOnPlatform,
  IIdentifyDomainObjects,
  IList,
  IMatchA,
  IPlatform,
  IPlaylist,
  IScore,
  Match,
  PlatformDto,
  Publisher,
  RunState,
  Series,
  Source,
  Tag,
  WithId,
}
