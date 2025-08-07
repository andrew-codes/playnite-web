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

type User = Omit<Prisma.UserGetPayload<{}>, 'password'> & {
  isAuthenticated?: boolean
}

type NullUser = Omit<User, 'createdAt' | 'updatedAt' | 'id'> & {
  id: null
}
type GraphUser = User | NullUser

type GraphLibrary = Prisma.LibraryGetPayload<{}>

export type {
  GameReleaseStateSubscriptionPayload,
  GraphCompletionStatus,
  GraphFeature,
  GraphGame,
  GraphLibrary,
  GraphPlatform,
  GraphPlaylist,
  GraphRelease,
  GraphSource,
  GraphTag,
  GraphUser,
  User,
}
