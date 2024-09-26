import { GraphQLError } from 'graphql'
import { fromString } from '../../../../../oid'
import type { MutationResolvers } from './../../../../../../../.generated/types.generated'

export const restartGameRelease: NonNullable<
  MutationResolvers['restartGameRelease']
> = async (_parent, _arg, _ctx) => {
  if (!_ctx.jwt?.user.isAuthenticated) {
    throw new GraphQLError('Unauthorized')
  }

  const releaseId = fromString(_arg.releaseId).id

  const release = await _ctx.api.gameRelease.getById(releaseId)
  if (!release) {
    throw new GraphQLError('No game release found')
  }

  if (!release.active) {
    throw new GraphQLError('Release is not currently active.')
  }

  await _ctx.mqttClient.publish(
    `playnite/request/game/restart`,
    JSON.stringify({
      game: {
        id: release.id,
        gameId: release.gameId,
        name: release.name,
        platform: {
          id: release.platform.id,
          name: release.platform.name,
        },
        source: release.source,
      },
    }),
  )

  _ctx.subscriptionPublisher.publish('gameActivationStateChanged', {
    active: true,
    restarted: true,
  })

  return release
}
