import {
  Alert,
  Button,
  Container,
  Snackbar,
  Stack,
  TextField,
  styled as muiStyled,
} from '@mui/material'
import { LoaderFunction, redirect } from '@remix-run/node'
import { useLocation, useNavigate } from '@remix-run/react'
import { FormEventHandler, useEffect } from 'react'
import { useRegisterAccount } from '../queryHooks/register'
import { injectUser } from '../server/auth/routeAuthorization'

const loader: LoaderFunction = injectUser(async (args, user) => {
  const isLoggedIn = user?.isAuthenticated
  if (isLoggedIn) {
    return redirect('/')
  }

  return null
})

const TallStack = muiStyled(Stack)`
  height: 100vh;
`

const Registration = () => {
  const [registerAccount, { data, error }] = useRegisterAccount()

  const handleSubmit: FormEventHandler<HTMLFormElement> = (evt) => {
    evt.preventDefault()
    const formData = new FormData(evt.currentTarget)
    const input = {
      username: formData.get('username') as string,
      email: formData.get('email') as string,
      name: formData.get('name') as string,
      password: formData.get('password') as string,
      passwordConfirmation: formData.get('passwordConfirmation') as string,
    }
    registerAccount({ variables: { input } })
  }
  const navigate = useNavigate()
  const location = useLocation()
  useEffect(() => {
    if (data?.signUp.user.isAuthenticated) {
      navigate('/account')
    }
  }, [location.search, data?.signUp.user.isAuthenticated])

  return (
    <form onSubmit={handleSubmit}>
      <Container fixed>
        <TallStack
          spacing={2}
          justifyContent="center"
          sx={(theme) => ({
            [theme.breakpoints.between('lg', 'xl')]: {
              margin: '0 24px 0 96px',
            },
          })}
        >
          <TextField
            name="email"
            label="Email"
            variant="outlined"
            autoComplete="email"
            required
          />
          <TextField
            name="username"
            label="Username"
            variant="outlined"
            autoComplete="username"
            required
          />
          <TextField
            name="name"
            type="text"
            label="Name"
            variant="outlined"
            autoComplete="name"
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
          <TextField
            name="passwordConfirmation"
            type="password"
            label="Confirm Password"
            variant="outlined"
            autoComplete="password"
            required
          />
          <Button variant="contained" type="submit">
            Create Account
          </Button>
        </TallStack>
      </Container>
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        open={!!error}
      >
        <Alert severity="error" variant="filled" sx={{ width: '100%' }}>
          Failed to create account. Please try again.
          <br />
          <br />
          {error?.message && ` ${error.message}`}
        </Alert>
      </Snackbar>
    </form>
  )
}

type SearchParams = { returnTo?: string }

export default Registration
export { loader }
export type { SearchParams }
