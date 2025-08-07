import type { QueryResolvers } from '../../../../../../../.generated/types.generated.js'
import logger from '../../../../../logger.js'
export const me: NonNullable<QueryResolvers['me']> = async (
  _parent,
  _arg,
  _ctx,
) => {
  if (!_ctx.jwt?.payload) {
    return {
      id: null,
      username: 'Unknown',
      email: 'Unknown',
      name: 'Unknown',
    }
  }
  logger.info('user payload', _ctx.jwt.payload)
  if (_ctx.jwt.payload.id === null) {
    return {
      id: null,
      username: 'Unknown',
      email: 'Unknown',
      name: 'Unknown',
    }
  }

  return _ctx.jwt?.payload
}
