import createDebugger from 'debug'
import { upperCase } from 'lodash-es'
import type { MutationResolvers } from './../../../../../../../.generated/types.generated'

const debug = createDebugger(
  'playnite-web/graphql/resolvers/Mutation/updateGameRelease',
)

export const updateGameRelease: NonNullable<
  MutationResolvers['updateGameRelease']
> = async (_parent, _arg, _ctx) => {
  try {
    _ctx.identityService.authorize(_ctx.jwt)
    const payloadData = {
      entityTypeName: 'Games',
      entityId: _arg.releaseId,
      fields: {} as Record<string, any>,
    }
    Object.entries(_arg.input).forEach(([key, value]) => {
      payloadData.fields[`${upperCase(key.at(0) ?? '')}${key.slice(1)}`] = value
    })

    debug('Publishing update request')
    debug(`Payload: ${JSON.stringify(payloadData)}`)

    await _ctx.mqttClient.publish(
      `playnite/request/update`,
      JSON.stringify(payloadData),
    )
  } catch (e) {
    console.error(e)
    return false
  }

  return true
}
