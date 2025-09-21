import { omit } from 'lodash-es'
import type { QueryResolvers } from './../../../../../../../.generated/types.generated'
export const lookupUser: NonNullable<QueryResolvers['lookupUser']> = async (
  _parent,
  _arg,
  _ctx,
) => {
  const user = await _ctx.db.user.findFirst({
    where: {
      username: _arg.username,
    },
  })

  if (!user) {
    return null
  }

  return omit(user, 'password')
}
