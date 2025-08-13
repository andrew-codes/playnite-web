import { merge } from 'lodash-es'
import type { QueryResolvers } from '../../../../../../../.generated/types.generated.js'
import logger from '../../../../../logger.js'
import { fromString, hasIdentity } from '../../../../../oid.js'

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
    }
  }

  const userId = fromString(_ctx.jwt.payload.id)
  if (!hasIdentity(userId)) {
    return {
      id: null,
      username: 'Unknown',
      email: 'Unknown',
      name: 'Unknown',
    }
  }

  return merge({}, _ctx.jwt?.payload, { id: userId.id })
}
