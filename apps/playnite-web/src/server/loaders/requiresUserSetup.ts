import { LoaderFunction, redirect } from '@remix-run/node'
import { prisma } from '../data/providers/postgres/client'
import logger from '../logger.js'

function requiresUserSetup(fn?: LoaderFunction): LoaderFunction {
  return async (args) => {
    const userCount = await prisma.user.count()

    logger.debug(`User count: ${userCount}`)

    if (userCount === 0) {
      logger.info('No users found, redirecting to account creation page')
      return redirect('/account/new', 307)
    }

    return fn?.(args) ?? null
  }
}

export { requiresUserSetup }
