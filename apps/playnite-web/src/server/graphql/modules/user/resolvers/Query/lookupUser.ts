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
    select: {
      id: true,
      username: true,
      Libraries: true,
    },
  })

  if (!user) {
    return null
  }

  return user
}
