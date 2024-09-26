import type { GameReleaseActivationSubscriptionPayloadResolvers } from './../../../../../../.generated/types.generated'
export const GameReleaseActivationSubscriptionPayload: GameReleaseActivationSubscriptionPayloadResolvers =
  {
    id: async (_parent, _arg, _ctx) => {
      return _parent.id
    },
    state: async (_parent, _arg, _ctx) => {
      return _parent.restarted
        ? 'Restarted'
        : _parent.active
          ? 'Started'
          : 'Stopped'
    },
  }
