import { Suspense } from 'react'
import { SignInForm } from '../../feature/account/components/SignInForm'
import MainNavigation from '../../feature/mainNavigation/components/MainNavigation'
import { Layout } from '../../feature/shared/components/Layout'

async function Login() {
  return (
    <Layout navs={[MainNavigation]}>
      <Suspense fallback={<div>Loading...</div>}>
        <SignInForm />
      </Suspense>
    </Layout>
  )
}

export default Login
