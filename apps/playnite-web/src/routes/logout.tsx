import { LoaderFunctionArgs } from '@remix-run/node'
import { authenticator } from '../api/auth/auth.server'

async function loader({ request }: LoaderFunctionArgs) {
  return await authenticator.logout(request, {
    redirectTo: '/',
  })
}

export { loader }
