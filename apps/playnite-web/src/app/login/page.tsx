import { Typography } from '@mui/material'
import { Suspense } from 'react'
import MainNavigation from '../../components/Navigation/MainNavigation'
import { SignInForm } from '../../feature/account/components/SignInForm'
import Header from '../../feature/shared/components/Header'
import { Layout } from '../../feature/shared/components/Layout'

async function Login() {
  return (
    <Layout
      title={
        <Header>
          <Typography variant="h1">Sign In</Typography>
        </Header>
      }
      navs={[MainNavigation]}
    >
      <Suspense fallback={<div>Loading...</div>}>
        <SignInForm />
      </Suspense>
    </Layout>
  )
}

export default Login
