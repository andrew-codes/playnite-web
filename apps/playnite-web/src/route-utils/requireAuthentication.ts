import { ActionFunctionArgs } from '@remix-run/node'
import { authenticator } from '../api/auth/auth.server'

const requireAuthentication =
  (routeHandler: (args: ActionFunctionArgs) => Promise<Response>) =>
  async (args: ActionFunctionArgs) => {
    const user = await authenticator.isAuthenticated(args.request)

    if (!user) {
      return new Response(null, {
        status: 401,
      })
    }

    return routeHandler(args)
  }

export { requireAuthentication }
