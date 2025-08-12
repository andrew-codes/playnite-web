import type { QueryResolvers } from '../../../../../../../.generated/types.generated.js'
import logger from '../../../../../logger.js'
import { createNull } from '../../../../../oid.js'
export const me: NonNullable<QueryResolvers['me']> = async (
  _parent,
  _arg,
  _ctx,
) => {
  logger.info('User from cookie.', _ctx.jwt.payload)

  if (!_ctx.jwt?.payload) {
    return {
      id: createNull('User'),
      username: 'Unknown',
      email: 'Unknown',
      name: 'Unknown',
    }
  }

  if (_ctx.jwt.payload.id === null) {
    return {
      id: createNull('User'),
      username: 'Unknown',
      email: 'Unknown',
      name: 'Unknown',
    }
  }

  return _ctx.jwt?.payload
}
