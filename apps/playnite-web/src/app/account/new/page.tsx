import { Typography } from '@mui/material'
import { User } from '../../../../.generated/types.generated'
import MainNavigation from '../../../components/Navigation/MainNavigation'
import { RegistrationForm } from '../../../feature/account/components/RegistrationForm'
import { MeQuery } from '../../../feature/account/queries'
import Header from '../../../feature/shared/components/Header'
import { Layout } from '../../../feature/shared/components/Layout'
import { PreloadQuery } from '../../../feature/shared/gql/client'

async function Registration() {
  return (
    <PreloadQuery<{ me: User }, {}> query={MeQuery}>
      {(meQueryRef) => (
        <Layout
          title={
            <Header>
              <Typography variant="h1">Create Account</Typography>
            </Header>
          }
          meQueryRef={meQueryRef}
          navs={[MainNavigation]}
        >
          <RegistrationForm />
        </Layout>
      )}
    </PreloadQuery>
  )
}

export default Registration
