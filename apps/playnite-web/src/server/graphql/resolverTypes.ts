import { RunState } from '../../feature/game/runStates'
import { DomainType } from '../oid'
import { Prisma } from './../data/providers/postgres/client'

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

type GraphPublicUser = {
  id: number
  username: string
  Libraries: Prisma.LibraryGetPayload<{}>[]
}

type ClaimUser = Omit<GraphUser, 'id'> & {
  id: string
}
type GraphLibrary = Prisma.LibraryGetPayload<{}>
type GraphLibrarySetting = Prisma.LibrarySettingGetPayload<{}>

type GraphSiteSetting = Prisma.SiteSettingsGetPayload<{}>
type GraphUserSetting = Prisma.UserSettingGetPayload<{}>

type GraphEntityUpdateDetails = {
  source: string
  id: number
  type: DomainType
  fields: Array<{
    key: string
    value: string
    values: Array<string>
    playniteId: string
    playniteIds: Array<string>
  }>
}
type GraphEntityCollectionUpdateDetails = {
  id: number
  type: DomainType
}

type GraphUsers = {
  userCount: number
  users: GraphPublicUser[]
}

type GraphAccountSetupStatus = {
  isSetup: boolean
  allowAnonymousAccountCreation: boolean
}

export type {
  ClaimUser,
  GameReleaseStateSubscriptionPayload,
  GraphAccountSetupStatus,
  GraphCompletionStatus,
  GraphEntityCollectionUpdateDetails,
  GraphEntityUpdateDetails,
  GraphFeature,
  GraphGame,
  GraphLibrary,
  GraphLibrarySetting,
  GraphPlatform,
  GraphPlaylist,
  GraphPublicUser,
  GraphRelease,
  GraphSiteSetting,
  GraphSource,
  GraphTag,
  GraphUser,
  GraphUsers,
  GraphUserSetting,
}
