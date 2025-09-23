import { Typography } from '@mui/material'
import { redirect } from 'next/navigation'
import {
  AccountSetupStatus,
  User,
} from '../../../../.generated/types.generated'
import MainNavigation from '../../../components/Navigation/MainNavigation'
import { RegistrationForm } from '../../../feature/account/components/RegistrationForm'
import { MeQuery } from '../../../feature/account/hooks/me'
import { AccountSetupStatusQuery } from '../../../feature/account/hooks/useAccountSetupStatus'
import Header from '../../../feature/shared/components/Header'
import { Layout } from '../../../feature/shared/components/Layout'
import { getClient } from '../../../feature/shared/gql/client'

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
