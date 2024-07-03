import _ from 'lodash'
import { nullUser } from '../../api/NullUser'
import type { QueryResolvers } from './../../../../types.generated'

const { omit } = _
export const me: NonNullable<QueryResolvers['me']> = async (
  _parent,
  _arg,
  _ctx,
) => {
  const user = _ctx.jwt?.user ?? nullUser

  return user
}
