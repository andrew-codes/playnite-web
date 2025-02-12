import { first } from 'lodash-es'
import {
  Connection,
  Platform,
  Release,
} from '../../../../../data/types.entities.js'
import { fromString } from '../../../../../oid.js'
import type { MutationResolvers } from './../../../../../../../.generated/types.generated.js'

export const restartGameRelease: NonNullable<
  MutationResolvers['restartGameRelease']
> = async (_parent, _arg, _ctx) => {
  _ctx.identityService.authorize(_ctx.jwt?.payload)

  const releaseId = fromString(_arg.releaseId).id

  const [release] = (await _ctx.queryApi.execute<Release>({
    entityType: 'Release',
    type: 'ExactMatch',
    field: 'id',
    value: releaseId,
  })) as Array<Release>

  await _ctx.updateQueryApi.executeUpdate<Release>(
    {
      entityType: 'Release',
      type: 'ExactMatch',
      field: 'id',
      value: releaseId,
    },
    { playniteWebRunState: 'restarting' },
  )
  _ctx.subscriptionPublisher.publish('playniteWebRunStateUpdated', {
    id: releaseId,
    runState: 'restarting',
  })

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
    `playnite/${connection.id}/request/release/restart`,
    JSON.stringify({
      release: {
        id: release.id,
        gameId: release.gameId,
        name: release.name,
        processId: release.processId,
        platform: {
          id: platform.id,
          name: platform.name,
        },
      },
    }),
  )

  return release
}
