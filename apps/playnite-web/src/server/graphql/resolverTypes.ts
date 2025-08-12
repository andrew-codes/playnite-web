import { Prisma } from '@prisma/client'
import { RunState } from '../data/types.entities.js'

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

type GraphUser = Omit<Prisma.UserGetPayload<{}>, 'password' | 'id'> & {
  id: string
  isAuthenticated?: boolean
}
type GraphLibrary = Prisma.LibraryGetPayload<{}>

type GraphSiteSetting = Prisma.SiteSettingsGetPayload<{}>

export type {
  GameReleaseStateSubscriptionPayload,
  GraphCompletionStatus,
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
  User,
}
