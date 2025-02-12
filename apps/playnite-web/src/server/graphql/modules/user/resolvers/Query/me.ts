import { User } from 'apps/playnite-web/src/server/data/types.entities.js'
import type { QueryResolvers } from '../../../../../../../.generated/types.generated.js'
import { createNull } from '../../../../../oid.js'

export const me: NonNullable<QueryResolvers['me']> = async (
  _parent,
  _arg,
  _ctx,
) => {
  const user: User =
    _ctx.jwt?.payload ??
    ({
      _type: 'User',
      id: createNull('User').toString(),
      username: 'Unknown',
      isAuthenticated: false,
    } as User)

  return user
}
