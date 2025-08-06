import { LoaderFunction, redirect } from '@remix-run/node'
import { prisma } from '../data/providers/postgres/client'

function requiresUserSetup(fn?: LoaderFunction): LoaderFunction {
  return async (args) => {
    const userCount = await prisma.user.count()

    if (userCount === 0) {
      return redirect('/account/new', 307)
    }

    return fn?.(args) ?? null
  }
}

export { requiresUserSetup }
