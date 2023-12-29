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

const runStates = [
  'installed',
  'installing',
  'launching',
  'running',
  'uninstalling',
  'not installed',
] as const
type RunState = (typeof runStates)[number]

type Game = {
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
  source?: Source
  tags?: Tag[]
}

interface Api {
  getGames(): Promise<Game[]>
}

export type {
  AgeRating,
  Api,
  CompletionStatus,
  Developer,
  Feature,
  Game,
  Genre,
  Platform,
  Publisher,
  RunState,
  Score,
  Series,
  Source,
  Tag,
}
