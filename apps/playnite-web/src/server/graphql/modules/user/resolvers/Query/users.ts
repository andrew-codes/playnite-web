import { QueryResolvers } from '../../../../../../../.generated/types.generated'
import { GraphPublicUser } from '../../../../resolverTypes'

export const users: NonNullable<QueryResolvers['users']> = async (
  _parent,
  args,
  { db },
) => {
  const userCount = await db.user.count()

  const page = args.page ?? 1
  const perPage = Math.min(args.perPage ?? 100, 100)
  const skip = (page - 1) * perPage

  const allUsers = await db.user.findMany({
    select: {
      id: true,
      username: true,
      Libraries: true,
    },
    skip,
    take: perPage,
    orderBy: {
      id: 'asc',
    },
  })

  const users: GraphPublicUser[] = allUsers

  return {
    userCount,
    users,
  }
}

export default users
