'use client'

import {
  Alert,
  Button,
  Checkbox,
  FormControlLabel,
  Snackbar,
  TextField,
} from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import { FC, FormEventHandler, useEffect } from 'react'
import { Form } from '../../shared/components/forms/Form'
import { PageTitle } from '../../shared/components/PageTitle'
import { useSignIn } from '../hooks/signIn'

const SignInForm: FC = () => {
  const [signIn, { data, loading, error }] = useSignIn()
  const router = useRouter()
  const searchParams = useSearchParams()

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

  useEffect(() => {
    if (data?.signIn.user.isAuthenticated) {
      const returnTo = searchParams.get('returnTo')
      router.push(returnTo ?? `/u/${data.signIn.user.username}`)
    }
  }, [
    data?.signIn.user.isAuthenticated,
    data?.signIn.user.username,
    router,
    searchParams,
  ])

  return (
    <>
      <PageTitle title="Sign In" />
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
        <Button variant="contained" type="submit" disabled={loading}>
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
    </>
  )
}

export { SignInForm }
