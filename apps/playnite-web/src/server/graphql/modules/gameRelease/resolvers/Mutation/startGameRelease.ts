import { GraphQLError } from 'graphql'
import _ from 'lodash'
import { fromString } from '../../../../../oid'
import type { MutationResolvers } from './../../../../../../../.generated/types.generated'

const { merge } = _

export const startGameRelease: NonNullable<
  MutationResolvers['startGameRelease']
> = async (_parent, _arg, _ctx) => {
  if (!_ctx.jwt?.user.isAuthenticated) {
    throw new GraphQLError('Unauthorized')
  }

  const releaseId = fromString(_arg.releaseId).id

  await _ctx.api.game.updateGameReleases(
    { 'releases.active': true },
    { active: false },
  )
  await _ctx.api.playlist.updateGameReleases(
    { 'games.releases.active': true },
    { active: false },
    { arrayFilters: [{ 'release.active': true }] },
  )

  await _ctx.api.game.updateGameReleases(
    { 'releases.id': releaseId },
    { active: true },
  )
  await _ctx.api.playlist.updateGameReleases(
    { 'games.releases.id': releaseId },
    { active: true },
    { arrayFilters: [{ 'release.id': releaseId }] },
  )

  const game = await _ctx.api.game.getBy({ 'releases.id': releaseId })
  const release = game?.[0]?.releases.find((r) => r.id === releaseId)
  if (!release) {
    throw new GraphQLError('No game release found')
  }

  let install =
    !release.isRunning &&
    !release.isInstalled &&
    !release.isInstalling &&
    !release.isUninstalling &&
    !release.isLaunching

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
        install,
      },
    }),
  )

  await _ctx.subscriptionPublisher.publish('gameActivationStateChanged', {
    id: releaseId,
    active: true,
  })

  return release
}
