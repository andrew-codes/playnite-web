import createDebugger from 'debug'
import { fromString } from '../../../../../oid.js'
import type { MutationResolvers } from './../../../../../../../.generated/types.generated'

const debug = createDebugger(
  'playnite-web/graphql/gameRelease/mutation/updateGameRelease',
)

export const updateGameRelease: NonNullable<
  MutationResolvers['updateGameRelease']
> = async (_parent, _arg, _ctx) => {
  try {
    _ctx.identityService.authorize(_ctx.jwt)

    const oid = fromString(_arg.releaseId)
    if (oid.type !== 'GameRelease') {
      debug(`Invalid entity Oid. Expected GameRelease, got ${oid.type}`)
      return false
    }

    _ctx.update({
      entityType: 'Release',
      entityId: oid.id,
      fields: _arg.input,
    })
  } catch (e) {
    console.error(e)
    return false
  }

  return true
}
