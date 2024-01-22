import { LoaderFunctionArgs } from '@remix-run/node'
import { authenticator } from '../api/auth/auth.server'

async function loader({ request }: LoaderFunctionArgs) {
  let url = new URL(request.url)
  let returnTo = url.searchParams.get('returnTo') as string | null

  return await authenticator.logout(request, {
    redirectTo: returnTo ?? '/',
  })
}

export { loader }
