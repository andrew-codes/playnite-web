import type { QueryResolvers } from '../../../../../../../.generated/types.generated.js'

export const me: NonNullable<QueryResolvers['me']> = async (
  _parent,
  _arg,
  _ctx,
) => {
  const user = _ctx.jwt?.payload ?? {
    _type: 'User',
    id: null,
    username: 'Unknown',
    email: 'Unknown',
    name: 'Unknown',
    isAuthenticated: false,
  }

  return user
}
