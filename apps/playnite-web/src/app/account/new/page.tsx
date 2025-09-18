import { Typography } from '@mui/material'
import {
  AccountSetupStatus,
  User,
} from 'apps/playnite-web/.generated/types.generated'
import MainNavigation from 'apps/playnite-web/src/components/Navigation/MainNavigation'
import { RegistrationForm } from 'apps/playnite-web/src/feature/account/components/RegistrationForm'
import { MeQuery } from 'apps/playnite-web/src/feature/account/hooks/me'
import { getClient } from 'apps/playnite-web/src/feature/shared/gql/client'
import { redirect } from 'next/navigation'
import Header from '../../../components/Header'
import { AccountSetupStatusQuery } from '../../../feature/account/hooks/useAccountSetupStatus'
import { Layout } from '../../../feature/shared/components/Layout'

async function Registration() {
  const accountSetupResult = await (
    await (
      await getClient()
    ).query
  )<{ accountSetupStatus: AccountSetupStatus }>({
    query: AccountSetupStatusQuery,
  })
  const meResult = await (
    await (
      await getClient()
    ).query
  )<{ me: User }>({
    query: MeQuery,
  })

  if (meResult.data?.me.isAuthenticated) {
    redirect('/')
  }
  if (
    accountSetupResult.data?.accountSetupStatus.isSetup &&
    !accountSetupResult.data?.accountSetupStatus.allowAnonymousAccountCreation
  ) {
    redirect('/')
  }

  return (
    <Layout
      title={
        <Header>
          <Typography variant="h1">Create Account</Typography>
        </Header>
      }
      navs={[MainNavigation]}
    >
      <RegistrationForm />
    </Layout>
  )
}

export default Registration
