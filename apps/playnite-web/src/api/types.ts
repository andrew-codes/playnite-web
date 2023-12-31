type DomainType =
  | 'ageRating'
  | 'assets'
  | 'company'
  | 'completionStatus'
  // | 'developer'
  | 'gameFeature'
  | 'games'
  | 'gameSource'
  | 'genre'
  | 'platforms'
  // | 'publisher'
  | 'region'
  | 'series'
  | 'tag'

interface IdentifyDomainObjects {
  id: string
  type: DomainType
  toString(): string
}

type WithOid = {
  oid: IdentifyDomainObjects
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

type GameAssetType = 'games' | 'platforms'

type GameAsset = WithOid & {
  id: string
  file: Buffer
  related: IdentifyDomainObjects
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

type Game = WithOid & {
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
  platforms?: Platform[]
  publishers?: Publisher[]
  recentActivity: Date
  releaseDate: Date
  runState: RunState
  series?: Series[]
  sortName: string
  source?: Source
  tags?: Tag[]
}

interface Api {
  getGameById(id: string): Promise<Game>
  getGames(): Promise<Game[]>
  getAssetRelatedTo(oid: IdentifyDomainObjects): Promise<Buffer>
}

export type {
  AgeRating,
  Api,
  CompletionStatus,
  Developer,
  DomainType,
  Feature,
  Game,
  GameAsset,
  GameAssetType,
  Genre,
  IdentifyDomainObjects,
  Platform,
  Publisher,
  RunState,
  Score,
  Series,
  Source,
  Tag,
}
