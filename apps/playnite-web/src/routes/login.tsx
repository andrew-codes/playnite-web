import {
  Alert,
  Button,
  Checkbox,
  FormControlLabel,
  Snackbar,
  Stack,
  TextField,
  Typography,
  styled as muiStyled,
} from '@mui/material'
import { useLocation, useNavigate } from '@remix-run/react'
import { FormEventHandler, useEffect } from 'react'
import { Form } from '../components/Form'
import Header from '../components/Header'
import Layout from '../components/Layout'
import MainNavigation from '../components/Navigation/MainNavigation'
import { useSignIn } from '../hooks/signIn'
import { requiresUserSetup } from '../server/loaders/requiresUserSetup'

const loader = requiresUserSetup()

const TallStack = muiStyled(Stack)`
`

const LoginForm = () => {
  const [signIn, { data, loading, error }] = useSignIn()

  const handleSubmit: FormEventHandler<HTMLFormElement> = (evt) => {
    evt.preventDefault()
    const formData = new FormData(evt.currentTarget)
    const input = {
      username: formData.get('username') as string,
      password: formData.get('password') as string,
      rememberMe: formData.has('rememberMe'),
    }
    signIn({ variables: { input } })
  }
  const navigate = useNavigate()
  const location = useLocation()
  useEffect(() => {
    if (data?.signIn.user.isAuthenticated) {
      const returnTo = new URLSearchParams(location.search).get('returnTo')
      navigate(returnTo ?? `/u/${data.signIn.user.username}`)
    }
  }, [
    location.search,
    data?.signIn.user.isAuthenticated,
    data?.signIn.user.username,
  ])

  return (
    <Layout
      title={
        <Header>
          <Typography variant="h1">Sign In</Typography>
        </Header>
      }
      navs={[MainNavigation]}
    >
      <Form onSubmit={handleSubmit}>
        <TextField
          name="username"
          label="Username"
          variant="outlined"
          autoComplete="username"
        />
        <TextField
          name="password"
          type="password"
          label="Password"
          variant="outlined"
          autoComplete="password"
        />
        <FormControlLabel
          control={<Checkbox name="rememberMe" size="medium" />}
          label="Remember Me"
        />
        <Button variant="contained" type="submit">
          Sign In
        </Button>
      </Form>
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        open={!!error}
        autoHideDuration={6000}
      >
        <Alert severity="error" variant="filled" sx={{ width: '100%' }}>
          Failed to authenticate. Please try again.
        </Alert>
      </Snackbar>
    </Layout>
  )
}

type SearchParams = { returnTo?: string }

export default LoginForm
export { loader }
export type { SearchParams }
