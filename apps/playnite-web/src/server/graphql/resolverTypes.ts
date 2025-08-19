import { Prisma } from '@prisma/client'
import { RunState } from '../data/types.entities.js'
import { DomainType } from '../oid.js'

type GameReleaseStateSubscriptionPayload = {
  id: string
  gameId: string
  runState: RunState
  processId: number | null
}
type GraphPlatform = Prisma.PlatformGetPayload<{}>
type GraphFeature = Prisma.FeatureGetPayload<{}>

type GraphCompletionStatus = Prisma.CompletionStatusGetPayload<{}>

type GraphTag = Prisma.TagGetPayload<{}>

type GraphSource = Prisma.SourceGetPayload<{}>

type GraphGame = Prisma.GameGetPayload<{}>

type GraphRelease = Prisma.ReleaseGetPayload<{}>

type GraphPlaylist = Prisma.PlaylistGetPayload<{}>

type GraphUser = Omit<Prisma.UserGetPayload<{}>, 'password'> & {
  isAuthenticated?: boolean
}

type ClaimUser = Omit<GraphUser, 'id'> & {
  id: string
}
type GraphLibrary = Prisma.LibraryGetPayload<{}>

type GraphSiteSetting = Prisma.SiteSettingsGetPayload<{}>
type GraphUserSetting = Prisma.UserSettingGetPayload<{}>

type GraphEntityUpdateDetails = {
  source: string
  id: number
  type: DomainType
  fields: Array<{ key: string; value: string; values?: Array<string> }>
}
type GraphEntityCollectionUpdateDetails = {
  id: number
  type: DomainType
}

export type {
  ClaimUser,
  GameReleaseStateSubscriptionPayload,
  GraphCompletionStatus,
  GraphEntityCollectionUpdateDetails,
  GraphEntityUpdateDetails,
  GraphFeature,
  GraphGame,
  GraphLibrary,
  GraphPlatform,
  GraphPlaylist,
  GraphRelease,
  GraphSiteSetting,
  GraphSource,
  GraphTag,
  GraphUser,
  GraphUserSetting,
}
