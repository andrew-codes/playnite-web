import _ from 'lodash'
import type { QueryResolvers } from '../../../../../../../.generated/types.generated'
import { nullUser } from '../../api/NullUser'

const { omit } = _
export const me: NonNullable<QueryResolvers['me']> = async (
  _parent,
  _arg,
  _ctx,
) => {
  const user = _ctx.jwt?.user ?? nullUser

  return user
}
