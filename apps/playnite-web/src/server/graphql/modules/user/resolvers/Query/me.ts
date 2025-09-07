import { merge, omit } from 'lodash-es'
import type { QueryResolvers } from '../../../../../../../.generated/types.generated.js'
import logger from '../../../../../logger.js'
import { fromString, hasIdentity } from '../../../../../oid.js'
import { GraphUser } from '../../../../resolverTypes.js'

export const me: NonNullable<QueryResolvers['me']> = async (
  _parent,
  _arg,
  _ctx,
) => {
  logger.info('User from cookie.', _ctx.jwt?.payload)

  if (!_ctx.jwt?.payload) {
    return {
      id: null,
      username: 'Unknown',
      email: 'Unknown',
      name: 'Unknown',
    } as unknown as GraphUser
  }

  const userId = fromString(_ctx.jwt.payload.id)
  if (!hasIdentity(userId)) {
    return {
      id: null,
      username: 'Unknown',
      email: 'Unknown',
      name: 'Unknown',
    } as unknown as GraphUser
  }

  return merge(
    {},
    _ctx.jwt.payload,
    omit(await _ctx.db.user.findUniqueOrThrow({ where: { id: userId.id } }), [
      'password',
    ]),
  )
}
