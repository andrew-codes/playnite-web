import { Platform, Release } from '../../../../../data/types.entities.js'
import { fromString } from '../../../../../oid.js'
import type { MutationResolvers } from './../../../../../../../.generated/types.generated.js'

export const startGameRelease: NonNullable<
  MutationResolvers['startGameRelease']
> = async (_parent, _arg, _ctx) => {
  _ctx.identityService.authorize(_ctx.jwt)

  const releaseId = fromString(_arg.releaseId).id
  await _ctx.updateQueryApi.executeUpdate<Release>(
    {
      entityType: 'Release',
      type: 'ExactMatch',
      field: 'id',
      value: releaseId,
    },
    { runState: { id: 'launching' } },
  )

  const [release] = (await _ctx.queryApi.execute<Release>({
    entityType: 'Release',
    type: 'ExactMatch',
    field: 'id',
    value: releaseId,
  })) as Array<Release>

  if (!release) {
    const gqlImport = await import('graphql')
    throw new gqlImport.GraphQLError('No game release found')
  }

  await _ctx.subscriptionPublisher.publish('releaseRunStateChanged', {
    gameId: release.gameId,
    id: release.id,
    runState: 'launching',
    processId: null,
  })

  const [platform] = (await _ctx.queryApi.execute<Platform>({
    entityType: 'Platform',
    type: 'ExactMatch',
    field: 'id',
    value: release.platformId,
  })) as Array<Platform>

  await _ctx.mqttClient.publish(
    `playnite/request/release/start`,
    JSON.stringify({
      game: {
        id: release.id,
        gameId: release.gameId,
        name: release.name,
        platform: {
          id: platform.id,
          name: platform.name,
        },
      },
    }),
  )

  return release
}
