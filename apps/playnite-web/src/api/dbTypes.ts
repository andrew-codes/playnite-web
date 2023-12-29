import { Document, WithId } from 'mongodb'
import type { Game } from './types'

type GameEntity = WithId<Document> &
  Omit<
    Game,
    | 'background'
    | 'cover'
    | 'developers'
    | 'features'
    | 'genres'
    | 'platforms'
    | 'publishers'
    | 'series'
    | 'tags'
  > & {
    ageRating: string
    backgroundImage: string
    communityScore: number | null
    completionStatus: string
    cover: string
    coverImage: string
    criticScore: number | null
    developersIds: string[]
    featuresIds: string[]
    genresIds: string[]
    isInstalled: boolean
    isInstalling: boolean
    isLaunching: boolean
    isRunning: boolean
    isUninstalling: boolean
    platformsIds: string[]
    publishersIds: string[]
    recentActivity: string
    releaseDate: string
    seriesIds: string[]
    sourceId: string
    tagsIds: string[]
  }

export type { GameEntity }
