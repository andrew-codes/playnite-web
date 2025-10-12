'use client'

import { Alert, Button, Snackbar, TextField } from '@mui/material'
import { useRouter } from 'next/navigation'
import { FC, FormEventHandler, useEffect } from 'react'
import { Form } from '../../shared/components/forms/Form'
import { useRegisterAccount } from '../hooks/register'

const RegistrationForm: FC = () => {
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
  const router = useRouter()
  useEffect(() => {
    if (data?.signUp.user.isAuthenticated) {
      router.push(`/u/${data.signUp.user.username}/account`)
    }
  }, [data?.signUp.user.isAuthenticated, data?.signUp.user.username, router])

  return (
    <div>
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
    </div>
  )
}

export { RegistrationForm }
