import { QueryResolvers } from '../../../../../../../.generated/types.generated'
import { GraphUser } from '../../../../resolverTypes'

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
    include: {
      Libraries: true,
      Settings: true,
    },
    skip,
    take: perPage,
    orderBy: {
      id: 'asc',
    },
  })

  const users: GraphUser[] = allUsers.map((user) => ({
    ...user,
    credential: null,
  }))

  return {
    userCount,
    users,
  }
}

export default users
