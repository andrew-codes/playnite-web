import { GraphQLError } from 'graphql'
import type { MutationResolvers } from '../../../../../../../.generated/types.generated'
import { fromString } from '../../../../../oid'
export const activateGameRelease: NonNullable<
  MutationResolvers['activateGameRelease']
> = async (_parent, _arg, _ctx) => {
  if (!_ctx.jwt?.user.isAuthenticated) {
    throw new GraphQLError('Unauthorized')
  }

  const releaseId = fromString(_arg.releaseId).id

  const release = await _ctx.api.gameRelease.getById(releaseId)
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
    `playnite/request/game/activate`,
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

  return release
}
