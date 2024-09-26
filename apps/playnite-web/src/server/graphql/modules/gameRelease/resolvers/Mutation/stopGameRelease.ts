import { GraphQLError } from 'graphql'
import { fromString } from '../../../../../oid'
import type { MutationResolvers } from './../../../../../../../.generated/types.generated'

export const stopGameRelease: NonNullable<
  MutationResolvers['stopGameRelease']
> = async (_parent, _arg, _ctx) => {
  if (!_ctx.jwt?.user.isAuthenticated) {
    throw new GraphQLError('Unauthorized')
  }

  const releaseId = fromString(_arg.releaseId).id

  await _ctx.api.game.updateGameReleases(
    { 'releases.id': releaseId },
    { active: false },
  )
  await _ctx.api.playlist.updateGameReleases(
    { 'games.releases.id': releaseId },
    { active: false },
    { arrayFilters: [{ 'release.id': releaseId }] },
  )

  const game = await _ctx.api.game.getBy({ 'releases.id': releaseId })
  const release = game?.[0]?.releases.find((r) => r.id === releaseId)
  if (!release) {
    throw new GraphQLError('No game release found')
  }
  await _ctx.mqttClient.publish(
    `playnite/request/game/stop`,
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

  _ctx.subscriptionPublisher.publish('gameActivationStateChanged', release)

  return release
}
