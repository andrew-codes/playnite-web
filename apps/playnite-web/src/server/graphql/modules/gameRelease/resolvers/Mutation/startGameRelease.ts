import { GraphQLError } from 'graphql'
import { fromString } from '../../../../../oid'
import type { MutationResolvers } from './../../../../../../../.generated/types.generated'

export const startGameRelease: NonNullable<
  MutationResolvers['startGameRelease']
> = async (_parent, _arg, _ctx) => {
  if (!_ctx.jwt?.user.isAuthenticated) {
    throw new GraphQLError('Unauthorized')
  }

  const releaseId = fromString(_arg.releaseId).id
  await _ctx.api.game.updateGameReleases(
    { 'releases.id': releaseId },
    { runState: 'launching' },
  )
  await _ctx.api.playlist.updateGameReleases(
    { 'games.releases.id': releaseId },
    { runState: 'launching' },
    { arrayFilters: [{ 'release.id': releaseId }] },
  )

  const game = await _ctx.api.game.getBy({ 'releases.id': releaseId })
  const release = game?.[0]?.releases.find((r) => r.id === releaseId)
  if (!release) {
    throw new GraphQLError('No game release found')
  }

  await _ctx.subscriptionPublisher.publish('releaseRunStateChanged', release)

  await _ctx.mqttClient.publish(
    `playnite/request/game/start`,
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

  return release
}
