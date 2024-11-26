import {
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  Stack,
  TextField,
  styled as muiStyled,
} from '@mui/material'
import { useLocation, useNavigate } from '@remix-run/react'
import { FormEventHandler, useEffect } from 'react'
import { useSignIn } from '../queryHooks'

const TallStack = muiStyled(Stack)`
  height: 100vh;
`

const LoginForm = () => {
  const [mutateFunction, { data, loading, error }] = useSignIn()

  const handleSubmit: FormEventHandler<HTMLFormElement> = (evt) => {
    evt.preventDefault()
    const formData = new FormData(evt.currentTarget)
    const input = {
      username: formData.get('username') as string,
      password: formData.get('password') as string,
      rememberMe: formData.has('rememberMe'),
    }
    mutateFunction({ variables: { input } })
  }
  const navigate = useNavigate()
  const location = useLocation()
  useEffect(() => {
    if (data?.signIn.user.isAuthenticated) {
      const returnTo = new URLSearchParams(location.search).get('returnTo')
      navigate(returnTo ?? '/')
    }
  }, [location.search, data?.signIn.user.isAuthenticated])

  return (
    <form method="POST" onSubmit={handleSubmit}>
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
    </form>
  )
}

type SearchParams = { returnTo?: string }

export default LoginForm
export type { SearchParams }
