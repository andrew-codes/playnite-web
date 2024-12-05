import { User } from 'apps/playnite-web/src/server/data/types.entities'
import type { QueryResolvers } from '../../../../../../../.generated/types.generated.js'
import { createNull } from '../../../../../oid.js'

export const me: NonNullable<QueryResolvers['me']> = async (
  _parent,
  _arg,
  _ctx,
) => {
  const user: User =
    _ctx.jwt ??
    ({
      _type: 'User',
      id: createNull('User').toString(),
      username: '',
      isAuthenticated: false,
    } as User)

  return user
}
