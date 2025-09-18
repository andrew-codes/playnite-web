import { Typography } from '@mui/material'
import { User } from 'apps/playnite-web/.generated/types.generated'
import MainNavigation from 'apps/playnite-web/src/components/Navigation/MainNavigation'
import { SignInForm } from 'apps/playnite-web/src/feature/account/components/SignInForm'
import { MeQuery } from 'apps/playnite-web/src/feature/account/hooks/me'
import { getClient } from 'apps/playnite-web/src/feature/shared/gql/client'
import { redirect } from 'next/navigation'
import Header from '../../components/Header'
import { ensureAccountSetup } from '../../feature/account/ensureAccountSetup'
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
      <SignInForm />
    </Layout>
  )
}

export default ensureAccountSetup(Login)
