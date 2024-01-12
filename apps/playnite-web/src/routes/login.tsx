import {
  Button,
  Container,
  Stack,
  TextField,
  styled as muiStyled,
} from '@mui/material'
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { Form } from '@remix-run/react'
import { authenticator } from '../api/auth/auth.server'

const TallStack = muiStyled(Stack)`
  height: 100vh;
`

const LoginForm = () => (
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
        <Button variant="contained">Sign In</Button>
      </TallStack>
    </Container>
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
