import { GraphQLError } from 'graphql'
import type { MutationResolvers } from '../../../../../../../.generated/types.generated'
import { create, fromString } from '../../../../../oid'
export const activateGameRelease: NonNullable<
  MutationResolvers['activateGameRelease']
> = async (_parent, _arg, _ctx) => {
  if (!_ctx.jwt?.user.isAuthenticated) {
    throw new GraphQLError('Unauthorized')
  }
  const id = fromString(_arg.id).id
  const gameRelease = await _ctx.api.gameRelease.getById(id)

  const allGameReleaseIds = (
    await _ctx.api.gameRelease.getBy({
      name: gameRelease.name,
    })
  ).map((gameRelease) => gameRelease.id)

  const gameId = create('Game', allGameReleaseIds.join(','))
  const gameReleases = await _ctx.api.game.getById(gameId.toString())

  const gameReleaseToActivate = gameReleases.find(
    (release) => release.id === id,
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
