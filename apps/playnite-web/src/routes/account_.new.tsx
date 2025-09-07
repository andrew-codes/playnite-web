import { Alert, Button, Snackbar, TextField, Typography } from '@mui/material'
import { LoaderFunction, redirect } from '@remix-run/node'
import { useLoaderData, useLocation, useNavigate } from '@remix-run/react'
import { ComponentType, FormEventHandler, useEffect } from 'react'
import { Form } from '../components/Form'
import Header from '../components/Header'
import Layout from '../components/Layout'
import MainNavigation from '../components/Navigation/MainNavigation'
import { useRegisterAccount } from '../hooks/register'
import { prisma } from '../server/data/providers/postgres/client'
import { injectUser } from '../server/loaders/requiresAuthorization'
import { defaultSettings } from '../server/siteSettings'

const loader: LoaderFunction = injectUser(async (args, user) => {
  const isLoggedIn = user?.isAuthenticated
  if (isLoggedIn) {
    return redirect('/')
  }

  const setting = await prisma.siteSettings.findUnique({
    where: { id: defaultSettings.allowAnonymousAccountCreation.id },
  })
  const userCount = await prisma.user.count()
  if (setting?.value !== 'true' && userCount > 0) {
    return redirect('/')
  }

  return { isSetup: userCount > 0 }
})

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
      navigate(`/u/${data.signUp.user.username}/account`)
    }
  }, [location.search, data?.signUp.user.isAuthenticated])

  return (
    <Layout
      title={
        <Header>
          <Typography variant="h1">Create Account</Typography>
        </Header>
      }
      navs={navs}
    >
      <Form data-name="registration" onSubmit={handleSubmit}>
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
      </Form>
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
    </Layout>
  )
}

type SearchParams = { returnTo?: string }

export default Registration
export { loader }
export type { SearchParams }
