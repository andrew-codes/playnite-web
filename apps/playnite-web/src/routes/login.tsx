import {
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  Stack,
  TextField,
  styled as muiStyled,
} from '@mui/material'
import {
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from '@remix-run/node'
import { Form } from '@remix-run/react'
import { authenticator } from '../api/auth/auth.server'
import { sessionStorage } from '../api/auth/session.server'

const TallStack = muiStyled(Stack)`
  height: 100vh;
`

const LoginForm = () => {
  return (
    <Form method="post">
      <Container fixed>
        <TallStack spacing={2} justifyContent="center">
          <TextField
            name="username"
            label="Username"
            variant="outlined"
            autoComplete="username"
            required
          />
          <TextField
            name="password"
            type="password"
            label="Password"
            variant="outlined"
            autoComplete="password"
            required
          />
          <FormControlLabel
            control={<Checkbox name="rememberMe" size="medium" />}
            label="Remember Me"
          />
          <Button variant="contained" type="submit">
            Sign In
          </Button>
        </TallStack>
      </Container>
    </Form>
  )
}

async function action({ request }: ActionFunctionArgs) {
  const user = await authenticator.authenticate('user-pass', request, {
    failureRedirect: '/login',
  })
  const session = await sessionStorage.getSession(request.headers.get('cookie'))
  session.set(authenticator.sessionKey, user)

  let url = new URL(request.url)
  let returnTo = url.searchParams.get('returnTo') as string | null

  return redirect(returnTo ?? '/', {
    headers: {
      'Set-Cookie': await sessionStorage.commitSession(session, {
        maxAge: user.shouldRememberMe ? 60 * 60 * 24 * 400 : undefined,
      }),
    },
  })
}

type SearchParams = { returnTo?: string }

async function loader({ request }: LoaderFunctionArgs) {
  return await authenticator.isAuthenticated(request, {
    successRedirect: '/',
  })
}

export default LoginForm
export { action, loader }
export type { SearchParams }
