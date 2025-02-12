import { first } from 'lodash-es'
import {
  Connection,
  Platform,
  Release,
} from '../../../../../data/types.entities.js'
import { fromString } from '../../../../../oid.js'
import type { MutationResolvers } from './../../../../../../../.generated/types.generated.js'

export const startGameRelease: NonNullable<
  MutationResolvers['startGameRelease']
> = async (_parent, _arg, _ctx) => {
  _ctx.identityService.authorize(_ctx.jwt?.payload)

  const releaseId = fromString(_arg.releaseId).id
  await _ctx.updateQueryApi.executeUpdate<Release>(
    {
      entityType: 'Release',
      type: 'ExactMatch',
      field: 'id',
      value: releaseId,
    },
    { playniteWebRunState: 'launching' },
  )
  _ctx.subscriptionPublisher.publish('playniteWebRunStateUpdated', {
    id: releaseId,
    runState: 'launching',
  })

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

  const [platform] = (await _ctx.queryApi.execute<Platform>({
    entityType: 'Platform',
    type: 'ExactMatch',
    field: 'id',
    value: release.platformId,
  })) as Array<Platform>

  const connection = first(
    await _ctx.queryApi.execute<Connection>({
      type: 'MatchAll',
      entityType: 'Connection',
    }),
  )
  if (!connection) {
    return release
  }

  await _ctx.mqttClient.publish(
    `playnite/${connection.id}/request/release/start`,
    JSON.stringify({
      release: {
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
