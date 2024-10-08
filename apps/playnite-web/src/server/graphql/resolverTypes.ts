import {
  CompletionStatus,
  Game,
  GameAsset,
  GameFeature,
  GameSource,
  Platform,
  Playlist,
  Release,
  RunState,
  Tag,
  User,
} from '../data/types.entities'

type GameReleaseStateSubscriptionPayload = {
  id: string
  gameId: string
  runState: RunState
  processId: number | null
}
type GraphPlatform = Platform
type GraphFeature = GameFeature

type GraphCompletionStatus = CompletionStatus

type GraphTag = Tag

type GraphSource = GameSource

type GraphGame = Game

type GraphRelease = Release

type GraphPlaylist = Playlist

type GraphGameAsset = GameAsset

type GraphUser = Omit<User, 'password'>

export type {
  GameReleaseStateSubscriptionPayload,
  GraphCompletionStatus,
  GraphFeature,
  GraphGame,
  GraphGameAsset,
  GraphPlatform,
  GraphPlaylist,
  GraphRelease,
  GraphSource,
  GraphTag,
  GraphUser,
}
