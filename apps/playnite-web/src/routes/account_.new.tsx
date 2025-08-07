import {
  Alert,
  Button,
  Container,
  styled as muiStyled,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { LoaderFunction, redirect } from '@remix-run/node'
import { useLoaderData, useLocation, useNavigate } from '@remix-run/react'
import { ComponentType, FormEventHandler, useEffect } from 'react'
import Layout from '../components/Layout'
import MainNavigation from '../components/Navigation/MainNavigation'
import { useRegisterAccount } from '../queryHooks/register'
import { prisma } from '../server/data/providers/postgres/client'
import { injectUser } from '../server/loaders/requiresAuthorization'

const loader: LoaderFunction = injectUser(async (args, user) => {
  const isLoggedIn = user?.isAuthenticated
  if (isLoggedIn) {
    return redirect('/')
  }

  const userCount = await prisma.user.count()
  return { isSetup: userCount > 0 }
})

const TallStack = muiStyled(Stack)`
  height: 100vh;
`

const Registration = () => {
  const { isSetup } = useLoaderData<{ isSetup: boolean }>()
  const navs: Array<ComponentType<{ open: boolean }>> = []
  if (isSetup) {
    navs.push(MainNavigation)
  }

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
      navigate(`/u/${data.signUp.user.id}/account`)
    }
  }, [location.search, data?.signUp.user.isAuthenticated])

  return (
    <Layout title="Create Account" navs={navs}>
      <Typography variant="h1" component="h1" gutterBottom>
        Create Account
      </Typography>
      <form data-name="registration" onSubmit={handleSubmit}>
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
            />
            <TextField
              name="username"
              label="Username"
              variant="outlined"
              autoComplete="username"
            />
            <TextField
              name="name"
              type="text"
              label="Name"
              variant="outlined"
              autoComplete="name"
            />
            <TextField
              name="password"
              type="password"
              label="Password"
              variant="outlined"
              autoComplete="password"
            />
            <TextField
              name="passwordConfirmation"
              type="password"
              label="Confirm Password"
              variant="outlined"
              autoComplete="password"
            />
            <Button variant="contained" type="submit">
              Create Account
            </Button>
          </TallStack>
        </Container>
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          open={!!error}
          autoHideDuration={null}
        >
          <Alert severity="error" variant="filled" sx={{ width: '100%' }}>
            Failed to create account. Please try again.
            <br />
            <br />
            {error?.message && ` ${error.message}`}
          </Alert>
        </Snackbar>
      </form>
    </Layout>
  )
}

type SearchParams = { returnTo?: string }

export default Registration
export { loader }
export type { SearchParams }
