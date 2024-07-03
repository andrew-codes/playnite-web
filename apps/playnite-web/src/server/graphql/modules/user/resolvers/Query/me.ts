import { omit } from 'lodash'
import { nullUser } from '../../api/NullUser'
import type { QueryResolvers } from './../../../../types.generated'
export const me: NonNullable<QueryResolvers['me']> = async (
  _parent,
  _arg,
  _ctx,
) => {
  const user = _ctx.jwt ?? nullUser

  return omit(user, 'password')
}
