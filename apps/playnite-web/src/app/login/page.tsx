import { Typography } from '@mui/material'
import { Suspense } from 'react'
import { User } from '../../../.generated/types.generated'
import MainNavigation from '../../components/Navigation/MainNavigation'
import { SignInForm } from '../../feature/account/components/SignInForm'
import { MeQuery } from '../../feature/account/queries'
import Header from '../../feature/shared/components/Header'
import { Layout } from '../../feature/shared/components/Layout'
import { PreloadQuery } from '../../feature/shared/gql/client'

async function Login() {
  return (
    <PreloadQuery<{ me: User }, {}> query={MeQuery}>
      {(meQueryRef) => (
        <Layout
          meQueryRef={meQueryRef}
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
      )}
    </PreloadQuery>
  )
}

export default Login
