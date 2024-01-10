import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { Form } from '@remix-run/react'
import { authenticator } from '../api/auth/auth.server'

const LoginForm = () => (
  <Form method="post">
    <input type="text" name="username" required />
    <input
      type="password"
      name="password"
      autoComplete="current-password"
      required
    />
    <button>Sign In</button>
  </Form>
)

async function action({ request }: ActionFunctionArgs) {
  return await authenticator.authenticate('user-pass', request, {
    successRedirect: '/',
    failureRedirect: '/login',
  })
}

async function loader({ request }: LoaderFunctionArgs) {
  return await authenticator.isAuthenticated(request, {
    successRedirect: '/',
  })
}

export default LoginForm
export { action, loader }
