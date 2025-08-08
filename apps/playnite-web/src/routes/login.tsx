import {
  Alert,
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  Snackbar,
  Stack,
  TextField,
  styled as muiStyled,
} from '@mui/material'
import { useLocation, useNavigate } from '@remix-run/react'
import { FormEventHandler, useEffect } from 'react'
import { useSignIn } from '../hooks'
// import { IdentityService, UsernamePasswordCredential } from '../server/auth'
// import * as cookies from '../server/cookies.js'
// import data from './../server/data/data.js'
import Layout from '../components/Layout'
import MainNavigation from '../components/Navigation/MainNavigation'
import { requiresUserSetup } from '../server/loaders/requiresUserSetup'

const loader = requiresUserSetup()

const TallStack = muiStyled(Stack)`
  height: 100vh;
`

// const action: ActionFunction = async ({ request }) => {
//   const requestIsForJson = request.headers.get('Accept') === 'application/json'
//   try {
//     const formData = await request.formData()
//     const username = formData.get('username') as string
//     const password = formData.get('password') as string
//     const rememberMe = (formData.get('rememberMe') as string) === 'on'

//     if (!username || !password) {
//       throw new Error('Invalid username or password')
//     }

//     const dataApi = await data()
//     const identityService = new IdentityService(
//       dataApi.query,
//       process.env.SECRET,
//       process.env.HOST,
//     )
//     const claim = await identityService.authenticate(
//       new UsernamePasswordCredential(username, password),
//     )

//     if (requestIsForJson) {
//       return Response.json({ token: claim.credential })
//     }

//     const expires = new Date()
//     expires.setFullYear(expires.getFullYear() + 1)

//     return redirect(new URLSearchParams(request.url).get('returnTo') ?? '/', {
//       headers: {
//         'Set-Cookie': await cookies.claim.serialize(claim.credential, {
//           expires: rememberMe ? expires : undefined,
//         }),
//       },
//     })
//   } catch (error) {
//     if (requestIsForJson) {
//       return Response.json(JSON.stringify('Failed to authenticate'), {
//         status: 401,
//       })
//     }

//     throw error
//   }
// }

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
    <Layout navs={[MainNavigation]}>
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
          </TallStack>
        </Container>
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          open={!!error}
          autoHideDuration={6000}
        >
          <Alert severity="error" variant="filled" sx={{ width: '100%' }}>
            Failed to authenticate. Please try again.
          </Alert>
        </Snackbar>
      </form>
    </Layout>
  )
}

type SearchParams = { returnTo?: string }

export default LoginForm
export { loader }
export type { SearchParams }
