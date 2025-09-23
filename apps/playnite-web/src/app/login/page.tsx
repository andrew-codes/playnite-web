import { Typography } from '@mui/material'
import { User } from '../../../.generated/types.generated'
import MainNavigation from '../../components/Navigation/MainNavigation'
import { SignInForm } from '../../feature/account/components/SignInForm'
import { MeQuery } from '../../feature/account/hooks/me'
import { getClient } from '../../feature/shared/gql/client'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { ensureAccountSetup } from '../../feature/account/ensureAccountSetup'
import Header from '../../feature/shared/components/Header'
import { Layout } from '../../feature/shared/components/Layout'

async function Login() {
  const meResult = await (
    await (
      await getClient()
    ).query
  )<User>({
    query: MeQuery,
  })

  if (meResult.data?.isAuthenticated) {
    redirect(`/u/${meResult.data.username}`)
  }

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

export default ensureAccountSetup(Login)
