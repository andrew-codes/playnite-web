import { GraphQLError } from 'graphql'
import type { MutationResolvers } from '../../../../../../../.generated/types.generated'
import { fromString } from '../../../../../oid'
export const activateGameRelease: NonNullable<
  MutationResolvers['activateGameRelease']
> = async (_parent, _arg, _ctx) => {
  if (!_ctx.jwt?.user.isAuthenticated) {
    throw new GraphQLError('Unauthorized')
  }

  const gameId = fromString(_arg.gameId).id
  const platformId = fromString(_arg.platformId).id

  const game = await _ctx.api.game.getById(gameId)
  const gameReleases = _ctx.api.game.toGameReleases(
    await Promise.all(
      game.releases.map((releaseId) => _ctx.api.gameRelease.getById(releaseId)),
    ),
  )

  const gameReleaseToActivate = gameReleases.find(
    (release) => release.platformSource.id === platformId,
  )
  if (!gameReleaseToActivate) {
    throw new GraphQLError('No game release found')
  }

  let install =
    !gameReleaseToActivate.isRunning &&
    !gameReleaseToActivate.isInstalled &&
    !gameReleaseToActivate.isInstalling &&
    !gameReleaseToActivate.isUninstalling &&
    !gameReleaseToActivate.isLaunching

  await _ctx.mqttClient.publish(
    `playnite/request/game/activate`,
    JSON.stringify({
      game: {
        id: gameReleaseToActivate.id,
        gameId: gameReleaseToActivate.gameId,
        name: gameReleaseToActivate.name,
        platform: {
          id: gameReleaseToActivate.platformSource.id,
          name: gameReleaseToActivate.platformSource.name,
        },
        source: gameReleaseToActivate.source,
        install,
      },
    }),
  )

  return gameReleaseToActivate
}
